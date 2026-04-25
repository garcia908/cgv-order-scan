import { logger } from "./logger";

type TelegramChat = {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  first_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  text?: string;
  from?: { first_name?: string; username?: string };
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

let lastUpdateId = 0;
let started = false;

async function sendMessage(token: string, chatId: number | string, text: string): Promise<void> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      logger.warn({ status: res.status, body, chatId }, "Telegram reply failed");
    }
  } catch (err) {
    logger.error({ err }, "Telegram reply threw");
  }
}

function buildWelcome(chat: TelegramChat, msg: TelegramMessage): string {
  const who =
    chat.type === "private"
      ? msg.from?.first_name || "kamu"
      : chat.title || "grup ini";

  return [
    `🍿 <b>CGV Snack Bar Bot</b>`,
    ``,
    `Halo ${escapeHtml(who)}! Bot ini siap mengirim notifikasi setiap pesanan baru masuk.`,
    ``,
    `<b>Chat ID ${chat.type === "private" ? "kamu" : "grup ini"}:</b>`,
    `<code>${chat.id}</code>`,
    ``,
    `Salin angka di atas dan masukkan ke setting <code>TELEGRAM_CHAT_ID</code> di Replit Secrets supaya notifikasi pesanan dikirim ke sini.`,
  ].join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function pollLoop(token: string): Promise<void> {
  while (true) {
    try {
      const url = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
      url.searchParams.set("timeout", "25");
      url.searchParams.set("allowed_updates", JSON.stringify(["message"]));
      if (lastUpdateId > 0) {
        url.searchParams.set("offset", String(lastUpdateId + 1));
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        logger.warn({ status: res.status }, "Telegram getUpdates non-OK");
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] };
      if (!data.ok || !Array.isArray(data.result)) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        const msg = update.message;
        if (!msg) continue;

        const text = (msg.text ?? "").trim();
        const chat = msg.chat;

        logger.info(
          { chatId: chat.id, chatType: chat.type, text },
          "Telegram message received",
        );

        // Reply to /start, /id, /chatid, or any first message in private chat
        if (
          text.toLowerCase().startsWith("/start") ||
          text.toLowerCase().startsWith("/id") ||
          text.toLowerCase().startsWith("/chatid") ||
          text.toLowerCase().startsWith("/myid")
        ) {
          await sendMessage(token, chat.id, buildWelcome(chat, msg));
        }
      }
    } catch (err) {
      logger.error({ err }, "Telegram poll loop error");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

export function startTelegramBot(): void {
  if (started) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN missing — bot polling disabled");
    return;
  }
  started = true;
  logger.info("Starting Telegram bot poller");
  void pollLoop(token);
}
