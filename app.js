const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  console.log("Mesaj geldi:", msg.text);
  bot.sendMessage(msg.chat.id, "Merhaba! Komutunu aldım.");
});
