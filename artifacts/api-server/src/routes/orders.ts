import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  GetOrdersSummaryResponse,
  ListOrdersResponse,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { sendOrderToTelegram } from "../lib/telegram";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function buildOrderCode(createdAt: Date): string {
  const yyyy = createdAt.getUTCFullYear();
  const mm = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(createdAt.getUTCDate()).padStart(2, "0");
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  return `CGV-${yyyy}${mm}${dd}-${suffix}`;
}

router.get("/orders", requireAuth, (_req, res): void => {
  res.json(ListOrdersResponse.parse([]));
});

router.get("/orders/summary", requireAuth, (_req, res): void => {
  res.json(
    GetOrdersSummaryResponse.parse({
      newOrdersToday: 0,
      revenueToday: 0,
      totalOrders: 0,
    }),
  );
});

router.get("/orders/:id", (req, res): void => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  res.status(404).json({ error: "Order history is not enabled" });
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cashReceived = parsed.data.cashReceived ?? null;
  if (parsed.data.paymentMethod === "CASH") {
    if (
      cashReceived === null ||
      !Number.isInteger(cashReceived) ||
      cashReceived < parsed.data.total
    ) {
      res.status(400).json({
        error: "Nominal uang tunai harus sama atau lebih besar dari total pesanan",
      });
      return;
    }
  } else if (cashReceived !== null) {
    res.status(400).json({
      error: "Nominal uang tunai hanya diperlukan untuk pembayaran cash",
    });
    return;
  }

  const createdAt = new Date();
  const order = {
    id: createdAt.getTime(),
    orderCode: buildOrderCode(createdAt),
    seatNumber: parsed.data.seatNumber,
    auditorium: parsed.data.auditorium,
    customerName: parsed.data.customerName,
    items: parsed.data.items,
    subtotal: parsed.data.subtotal,
    total: parsed.data.total,
    paymentMethod: parsed.data.paymentMethod,
    cashReceived,
    status: "baru" as const,
    createdAt,
    updatedAt: createdAt,
  };

  try {
    await sendOrderToTelegram(order);
  } catch (err) {
    logger.error({ err, orderCode: order.orderCode }, "Order Telegram notification failed");
    res.status(502).json({ error: "Pesanan gagal dikirim ke Telegram" });
    return;
  }

  res.status(201).json(GetOrderResponse.parse(order));
});

router.patch("/orders/:id/status", requireAuth, (req, res): void => {
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

  res.status(410).json({ error: "Order history is not enabled" });
});

router.delete("/orders", requireAuth, (_req, res): void => {
  res.status(410).json({ error: "Order history is not enabled" });
});

export default router;
