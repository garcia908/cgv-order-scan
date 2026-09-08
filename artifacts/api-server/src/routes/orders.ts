import { Router, type IRouter } from "express";
import { eq, desc, sql, gte } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
  GetOrdersSummaryResponse,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";
import { sendOrderToTelegram } from "../lib/telegram";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function buildOrderCode(id: number, createdAt: Date): string {
  const yyyy = createdAt.getUTCFullYear();
  const mm = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(createdAt.getUTCDate()).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `CGV-${yyyy}${mm}${dd}-${seq}`;
}

type DeliveryInfo = {
  seatNumber: string;
  auditorium: string;
  customerName: string;
};

function deliveryFromRow(row: {
  tableNumber: string;
  seatNumber: string | null;
  auditorium: string | null;
  customerName: string | null;
}): DeliveryInfo {
  return {
    seatNumber: row.seatNumber?.trim() || "—",
    auditorium: row.auditorium?.trim() || "—",
    customerName: row.customerName?.trim() || "—",
  };
}

function toApiOrder(row: typeof ordersTable.$inferSelect) {
  const { tableNumber: _legacyTableNumber, seatNumber: _seatNumber, auditorium: _auditorium, customerName: _customerName, ...order } = row;
  return { ...order, ...deliveryFromRow(row) };
}

router.get("/orders", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(rows.map(toApiOrder)));
});

router.get("/orders/summary", requireAuth, async (_req, res): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todays = await db
    .select()
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, startOfDay));

  const totalCountRows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(ordersTable);
  const totalOrders = totalCountRows[0]?.c ?? 0;

  const summary = {
    newOrdersToday: todays.filter((o) => o.status === "baru").length,
    revenueToday: todays.reduce((sum, o) => sum + o.total, 0),
    totalOrders,
  };

  res.json(GetOrdersSummaryResponse.parse(summary));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(toApiOrder(order)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cashReceived = parsed.data.cashReceived ?? null;
  if (parsed.data.paymentMethod === "CASH") {
    if (cashReceived === null || !Number.isInteger(cashReceived) || cashReceived < parsed.data.total) {
      res.status(400).json({ error: "Nominal uang tunai harus sama atau lebih besar dari total pesanan" });
      return;
    }
  } else if (cashReceived !== null) {
    res.status(400).json({ error: "Nominal uang tunai hanya diperlukan untuk pembayaran cash" });
    return;
  }

  // Insert with placeholder code, then update with real code based on id+date.
  const [inserted] = await db
    .insert(ordersTable)
    .values({
      orderCode: "PENDING",
      tableNumber: "AUDITORIUM_ORDER",
      seatNumber: parsed.data.seatNumber,
      auditorium: parsed.data.auditorium,
      customerName: parsed.data.customerName,
      items: parsed.data.items,
      subtotal: parsed.data.subtotal,
      total: parsed.data.total,
      paymentMethod: parsed.data.paymentMethod,
      cashReceived,
      status: "baru",
    })
    .returning();

  if (!inserted) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  const orderCode = buildOrderCode(inserted.id, inserted.createdAt);
  const [final] = await db
    .update(ordersTable)
    .set({ orderCode })
    .where(eq(ordersTable.id, inserted.id))
    .returning();

  if (final) {
    // Fire-and-forget Telegram notification — never block the response
    void sendOrderToTelegram({
      orderCode: final.orderCode,
      seatNumber: final.seatNumber ?? "—",
      auditorium: final.auditorium ?? "—",
      customerName: final.customerName ?? "—",
      items: final.items,
      total: final.total,
      paymentMethod: final.paymentMethod,
      cashReceived: final.cashReceived,
      createdAt: final.createdAt,
    });
  }

  res.status(201).json(GetOrderResponse.parse(toApiOrder(final)));
});

router.patch("/orders/:id/status", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse(toApiOrder(order)));
});

router.delete("/orders", requireAuth, async (_req, res): Promise<void> => {
  await db.delete(ordersTable);
  res.sendStatus(204);
});

export default router;
