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

const router: IRouter = Router();

function buildOrderCode(id: number, createdAt: Date): string {
  const yyyy = createdAt.getUTCFullYear();
  const mm = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(createdAt.getUTCDate()).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `CGV-${yyyy}${mm}${dd}-${seq}`;
}

router.get("/orders", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(rows));
});

router.get("/orders/summary", async (_req, res): Promise<void> => {
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

  res.json(GetOrderResponse.parse(order));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Insert with placeholder code, then update with real code based on id+date.
  const [inserted] = await db
    .insert(ordersTable)
    .values({
      orderCode: "PENDING",
      tableNumber: parsed.data.tableNumber,
      items: parsed.data.items,
      subtotal: parsed.data.subtotal,
      total: parsed.data.total,
      paymentMethod: parsed.data.paymentMethod,
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
      tableNumber: final.tableNumber,
      items: final.items,
      total: final.total,
      paymentMethod: final.paymentMethod,
      createdAt: final.createdAt,
    });
  }

  res.status(201).json(GetOrderResponse.parse(final));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
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

  res.json(UpdateOrderStatusResponse.parse(order));
});

router.delete("/orders", async (_req, res): Promise<void> => {
  await db.delete(ordersTable);
  res.sendStatus(204);
});

export default router;
