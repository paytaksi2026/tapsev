
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const { TOKEN, ADMIN_ID } = require('./config');

const bot = new TelegramBot(TOKEN, { polling: true });
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    city TEXT,
    gender TEXT,
    photo TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes(
    from_id INTEGER,
    to_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS matches(
    user1 INTEGER,
    user2 INTEGER
  )`);
});

const state = {};

bot.onText(/\/start/, msg => {
  const id = msg.chat.id;
  state[id] = { step: "name" };
  bot.sendMessage(id,"❤️ TapSev-ə xoş gəldin!\nAdını yaz:");
});

bot.on("message", msg => {
  const id = msg.chat.id;
  if(!state[id]) return;

  const step = state[id].step;

  if(step==="name"){
    state[id].name = msg.text;
    state[id].step="age";
    bot.sendMessage(id,"Yaşını yaz:");
    return;
  }

  if(step==="age"){
    state[id].age = msg.text;
    state[id].step="city";
    bot.sendMessage(id,"Şəhər:");
    return;
  }

  if(step==="city"){
    state[id].city = msg.text;
    state[id].step="gender";
    bot.sendMessage(id,"Cins (kişi / qadın):");
    return;
  }

  if(step==="gender"){
    state[id].gender = msg.text;
    state[id].step="photo";
    bot.sendMessage(id,"Profil şəklini göndər:");
    return;
  }

  if(step==="photo" && msg.photo){
    const photo = msg.photo[msg.photo.length-1].file_id;

    db.run(
      "INSERT OR REPLACE INTO users(id,name,age,city,gender,photo) VALUES(?,?,?,?,?,?)",
      [id,state[id].name,state[id].age,state[id].city,state[id].gender,photo]
    );

    delete state[id];

    bot.sendMessage(id,"✅ Profil yaradıldı!",{
      reply_markup:{
        keyboard:[
          ["❤️ Tanış ol"],
          ["👤 Profilim"]
        ],
        resize_keyboard:true
      }
    });

    if(ADMIN_ID){
      bot.sendMessage(ADMIN_ID,"Yeni istifadəçi: "+id);
    }
  }
});

bot.onText(/👤 Profilim/, msg => {
  const id = msg.chat.id;
  db.get("SELECT * FROM users WHERE id=?",[id],(e,row)=>{
    if(!row){
      bot.sendMessage(id,"Profil tapılmadı");
      return;
    }

    bot.sendPhoto(id,row.photo,{
      caption:`👤 ${row.name}\n🎂 ${row.age}\n📍 ${row.city}`
    });
  });
});

bot.onText(/❤️ Tanış ol/, msg => {
  const id = msg.chat.id;

  db.get(
    "SELECT * FROM users WHERE id!=? AND city=(SELECT city FROM users WHERE id=?) ORDER BY RANDOM() LIMIT 1",
    [id,id],
    (e,row)=>{

      if(!row){
        bot.sendMessage(id,"Şəhərində istifadəçi tapılmadı.");
        return;
      }

      bot.sendPhoto(id,row.photo,{
        caption:`👤 ${row.name}\n🎂 ${row.age}\n📍 ${row.city}`,
        reply_markup:{
          inline_keyboard:[[
            {text:"👍 Bəyən",callback_data:"like_"+row.id},
            {text:"👎 Keç",callback_data:"skip"}
          ]]
        }
      });
    }
  );
});

bot.on("callback_query", q=>{
  const data = q.data;
  const from = q.message.chat.id;

  if(data.startsWith("like_")){
    const to = data.split("_")[1];

    db.run("INSERT INTO likes(from_id,to_id) VALUES(?,?)",[from,to]);

    db.get(
      "SELECT * FROM likes WHERE from_id=? AND to_id=?",
      [to,from],
      (e,row)=>{
        if(row){

          db.run("INSERT INTO matches(user1,user2) VALUES(?,?)",[from,to]);

          bot.sendMessage(from,"💘 Match! Artıq yazışa bilərsiniz.");
          bot.sendMessage(to,"💘 Match! Artıq yazışa bilərsiniz.");
        }
      }
    );

    bot.answerCallbackQuery(q.id,{text:"Bəyənildi ❤️"});
  }

  if(data==="skip"){
    bot.answerCallbackQuery(q.id,{text:"Keçildi"});
  }
});

console.log("TapSev bot işləyir...");
