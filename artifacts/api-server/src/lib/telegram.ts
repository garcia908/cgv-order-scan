import { logger } from "./logger";

type OrderItemPayload = {
  name: string;
  qty: number;
  price: number;
};

type OrderPayload = {
  orderCode: string;
  tableNumber: string;
  items: OrderItemPayload[];
  total: number;
  paymentMethod: string;
  cashReceived?: number | null;
  createdAt: Date | string;
};

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Cash (dibayar saat diantar)",
  QRIS: "QRIS (dibayar dengan EDC)",
  DEBIT: "Debit (dibayar dengan EDC)",
  VA_BCA: "Virtual Account BCA (riwayat)",
  VA_MANDIRI: "Virtual Account Mandiri (riwayat)",
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMessage(order: OrderPayload): string {
  const time = new Date(order.createdAt).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const itemLines = order.items
    .map((i) => `• ${i.qty}x ${escapeHtml(i.name)} — ${formatRupiah(i.price * i.qty)}`)
    .join("\n");

  const payment = PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod;
  const paymentDetails =
    order.paymentMethod === "CASH" && order.cashReceived
      ? [
          `💵 Uang disiapkan: <b>${formatRupiah(order.cashReceived)}</b>`,
          `↩️ Perkiraan kembalian: <b>${formatRupiah(order.cashReceived - order.total)}</b>`,
        ]
      : order.paymentMethod === "CASH"
        ? ["💵 Staff menagih pembayaran cash saat pesanan diantar."]
        : ["🧾 Staff membawa EDC saat mengantar pesanan."];

  return [
    `🍿 <b>PESANAN BARU MASUK</b>`,
    ``,
    `🆔 <b>${escapeHtml(order.orderCode)}</b>`,
    `📍 Meja: <b>${escapeHtml(order.tableNumber)}</b>`,
    `🕒 ${escapeHtml(time)}`,
    ``,
    `<b>Pesanan:</b>`,
    itemLines,
    ``,
    `💰 Total: <b>${formatRupiah(order.total)}</b>`,
    `💳 Pembayaran: ${escapeHtml(payment)}`,
    ...paymentDetails,
    ``,
    `Status: <i>baru</i> — silakan disiapkan.`,
  ].join("\n");
}

export async function sendOrderToTelegram(order: OrderPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn("Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: buildMessage(order),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error({ status: res.status, body: text }, "Telegram sendMessage failed");
      return;
    }

    logger.info({ orderCode: order.orderCode }, "Telegram notification sent");
  } catch (err) {
    logger.error({ err }, "Telegram sendMessage threw");
  }
}
