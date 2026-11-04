import { logger } from "./logger";

type OrderItemPayload = {
  name: string;
  qty: number;
  price: number;
};

type OrderPayload = {
  orderCode: string;
  seatNumber: string;
  auditorium: string;
  customerName: string;
  items: OrderItemPayload[];
  total: number;
  paymentMethod: string;
  cashReceived?: number | null;
  createdAt: Date | string;
};

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Cash (dibayar saat diantar)",
  QRIS: "QRIS (dibayar bersama staff)",
  DEBIT: "Debit (dibayar bersama staff)",
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
        : ["🧾 Ditunggu ya, staff akan datang ke bangkumu."];

  return [
    `🍿 <b>PESANAN BARU MASUK</b>`,
    ``,
    `🆔 <b>${escapeHtml(order.orderCode)}</b>`,
    `🪑 Kursi: <b>${escapeHtml(order.seatNumber)}</b>`,
    `🎬 Auditorium: <b>${escapeHtml(order.auditorium)}</b>`,
    `👤 Atas nama: <b>${escapeHtml(order.customerName)}</b>`,
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
    throw new Error(
      "Telegram is not configured; set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID",
    );
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: buildMessage(order),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const result: unknown = await res.json();
  if (
    !res.ok ||
    typeof result !== "object" ||
    result === null ||
    !("ok" in result) ||
    result.ok !== true
  ) {
    throw new Error(
      `Telegram sendMessage failed (${res.status}): ${JSON.stringify(result)}`,
    );
  }

  logger.info({ orderCode: order.orderCode }, "Telegram notification sent");
}
