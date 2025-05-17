const TelegramBot = require("node-telegram-bot-api");

const token = "7264659671:AAFrfj6yL7mi-lPHJH4obV0I9dMLUwFEGak";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  console.log("Mesaj geldi:", msg.text);
  bot.sendMessage(msg.chat.id, "Merhaba! Komutunu aldım.");
});
