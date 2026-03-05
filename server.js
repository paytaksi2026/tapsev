
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const { TOKEN } = require('./config');

const bot = new TelegramBot(TOKEN, { polling: true });

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    city TEXT,
    gender TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    from_id INTEGER,
    to_id INTEGER
  )`);
});

const userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { step: 'name' };
  bot.sendMessage(chatId, "❤️ TapSev-ə xoş gəldin!\nAdını yaz:");
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!userState[chatId]) return;

  const state = userState[chatId];

  if (state.step === 'name') {
    state.name = msg.text;
    state.step = 'age';
    bot.sendMessage(chatId, "Yaşını yaz:");
  } 
  else if (state.step === 'age') {
    state.age = msg.text;
    state.step = 'city';
    bot.sendMessage(chatId, "Şəhər:");
  }
  else if (state.step === 'city') {
    state.city = msg.text;
    state.step = 'gender';
    bot.sendMessage(chatId, "Cins (kişi / qadın):");
  }
  else if (state.step === 'gender') {
    state.gender = msg.text;

    db.run(
      "INSERT OR REPLACE INTO users(id,name,age,city,gender) VALUES(?,?,?,?,?)",
      [chatId, state.name, state.age, state.city, state.gender]
    );

    delete userState[chatId];

    bot.sendMessage(chatId, "✅ Profil yaradıldı!", {
      reply_markup: {
        keyboard: [
          ["❤️ Tanış ol"],
          ["👤 Profilim"]
        ],
        resize_keyboard: true
      }
    });
  }
});

bot.onText(/❤️ Tanış ol/, (msg) => {
  const chatId = msg.chat.id;

  db.get(
    "SELECT * FROM users WHERE id != ? ORDER BY RANDOM() LIMIT 1",
    [chatId],
    (err, row) => {
      if (!row) {
        bot.sendMessage(chatId, "Hələ istifadəçi yoxdur.");
        return;
      }

      bot.sendMessage(
        chatId,
        `👤 ${row.name}\n🎂 ${row.age}\n📍 ${row.city}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "👍 Bəyən", callback_data: "like_" + row.id },
                { text: "👎 Keç", callback_data: "skip" }
              ]
            ]
          }
        }
      );
    }
  );
});

bot.on("callback_query", (query) => {
  const data = query.data;
  const fromId = query.message.chat.id;

  if (data.startsWith("like_")) {
    const toId = data.split("_")[1];

    db.run("INSERT INTO likes(from_id,to_id) VALUES(?,?)", [fromId, toId]);

    db.get(
      "SELECT * FROM likes WHERE from_id=? AND to_id=?",
      [toId, fromId],
      (err, row) => {
        if (row) {
          bot.sendMessage(fromId, "🎉 Match! Bir-birinizi bəyəndiniz.");
          bot.sendMessage(toId, "🎉 Match! Bir-birinizi bəyəndiniz.");
        }
      }
    );

    bot.answerCallbackQuery(query.id, { text: "Bəyənildi ❤️" });
  }

  if (data === "skip") {
    bot.answerCallbackQuery(query.id, { text: "Keçildi" });
  }
});

console.log("TapSev bot işləyir...");
