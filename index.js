require('dotenv').config();

const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN not found!");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(express.json());

// /start komutu
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "🎮 Play PetMiner",
          web_app: { url: "https://begeken.github.io/Mpet/" }
        }]
      ]
    }
  };

  bot.sendMessage(chatId, "👋 Welcome to PetMiner! Press the button below to start playing:", opts);
});

// /help komutu
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `🎮 Welcome to Petminer!\n\n` +
    `Petminer is a fun Telegram WebApp game where you mine coins called MPET by playing!\n\n` +
    `🧩 How to play:\n` +
    `- Type /start to see the play button\n` +
    `- Click it to open the game inside Telegram\n` +
    `- Earn coins every 8 hours by mining\n` +
    `- Invite friends and earn more rewards!\n\n` +
    `🛠️ Available commands:\n` +
    `/start – Start the game  \n` +
    `/help – Show this help message  \n\n` +
    `Have fun! 🚀`;

  bot.sendMessage(chatId, helpMessage);
});

// Diğer mesajlar için
bot.on('message', (msg) => {
  const text = msg.text?.toLowerCase();
  if (text === '/start' || text === '/help') return;

  bot.sendMessage(msg.chat.id, `👋 Hello ${msg.from.first_name}, welcome to PetMiner! Type /start to play.`);
});

// Frontend'den gelen veriyi dinleyen endpoint
app.post('/api/telegram', (req, res) => {
  const { user_id, action, coins } = req.body;
  console.log('Frontendden veri geldi:', req.body);

  bot.sendMessage(user_id, `✅ Transaction recorded: ${coins} coins!`);

  res.json({ status: 'ok' });
});

// Server başlat
app.listen(port, () => {
  console.log(`✅ Backend bot server is running on port ${port}.`);
});
