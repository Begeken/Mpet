require('dotenv').config();

const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN bulunamadı!");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(express.json());

/* ======= Arkadaş Sistemi ve Coin Yönetimi ======= */

// Arkadaş listesini ve kullanıcı coinlerini basit hafızada tutuyoruz
const friendsMap = new Map();  // userId -> Set of friendIds
const userCoins = new Map();   // userId -> coin miktarı

// Arkadaş listesini al
function getFriends(userId) {
  return friendsMap.get(userId) || new Set();
}

// Arkadaş ekle
function addFriend(userId, friendId) {
  if (!friendsMap.has(userId)) {
    friendsMap.set(userId, new Set());
  }
  friendsMap.get(userId).add(friendId);
}

// Coin ekle (mevcut coinlere ekler)
function addCoins(userId, amount) {
  const current = userCoins.get(userId) || 0;
  userCoins.set(userId, current + amount);
}

// Bonuslu coin hesaplama (%10 bonus her arkadaş için)
function calculateBonusCoins(userId, baseAmount) {
  const friendsCount = getFriends(userId).size;
  const bonusPercent = friendsCount * 10; // %10 bonus per friend
  return Math.floor(baseAmount * (1 + bonusPercent / 100));
}

/* ======= Telegram Bot Komutları ======= */

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

  const helpMessage = `🆘 *How to Play PetMiner*\n\n` +
    `🐾 PetMiner is a game where you mine coins every 8 hours.\n` +
    `💰 Tap the "Mine" button to earn coins.\n` +
    `👥 Invite your friends and earn bonuses!\n\n` +
    `Use /start to begin playing.\n\n` +
    `Commands:\n` +
    `/addfriend <TelegramID> - Add a friend by their Telegram ID\n` +
    `/friendsleaderboard - Show your friends' coin leaderboard`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});

// /addfriend komutu
bot.onText(/\/addfriend (\d+)/, (msg, match) => {
  const userId = msg.from.id;
  const friendId = parseInt(match[1], 10);

  if (friendId === userId) {
    bot.sendMessage(userId, "You can't add yourself as a friend.");
    return;
  }

  addFriend(userId, friendId);
  bot.sendMessage(userId, `Friend with Telegram ID ${friendId} added successfully! You now have ${getFriends(userId).size} friends.`);
});

// /friendsleaderboard komutu
bot.onText(/\/friendsleaderboard/, (msg) => {
  const userId = msg.from.id;
  const friends = Array.from(getFriends(userId));

  if (friends.length === 0) {
    bot.sendMessage(userId, "You don't have any friends added yet.");
    return;
  }

  const leaderboard = friends.map(fid => ({
    id: fid,
    coins: userCoins.get(fid) || 0
  })).sort((a, b) => b.coins - a.coins);

  let text = "🏆 Friends Leaderboard:\n";
  leaderboard.forEach((f, i) => {
    text += `${i + 1}. ID ${f.id}: ${f.coins} coins\n`;
  });

  bot.sendMessage(userId, text);
});

// Diğer mesajlar (start/help dışı)
bot.on('message', (msg) => {
  const text = msg.text?.toLowerCase();
  if (text === '/start' || text === '/help') return;

  bot.sendMessage(msg.chat.id, `👋 Hello ${msg.from.first_name}, welcome to PetMiner! Type /start to play.`);
});

/* ======= Frontend’den gelen mining işlemi ======= */
app.post('/api/telegram', (req, res) => {
  const { user_id, action, coins } = req.body;
  console.log('Frontendden veri geldi:', req.body);

  if (action === 'mine') {
    const bonusCoins = calculateBonusCoins(user_id, coins);
    addCoins(user_id, bonusCoins);
    bot.sendMessage(user_id, `You mined ${coins} coins + bonus: ${bonusCoins - coins} coins = ${bonusCoins} coins total!`);
  } else {
    bot.sendMessage(user_id, `✅ Transaction recorded: ${coins} coins!`);
  }

  res.json({ status: 'ok' });
});

/* ======= Server Başlatma ======= */
app.listen(port, () => {
  console.log(`✅ Backend bot server ${port} portunda çalışıyor.`);
});
