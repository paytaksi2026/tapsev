const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

let queue = [];
let current = null;

let stats = { win:[], like:[], gift:[] };

let likeValue = {};
let likeLevel = {};
let giftValue = {};
let giftLevel = {};

function upsert(arr, name, avatar, value){
  let u = arr.find(x=>x.name===name);
  if(!u){
    u={name, avatar, value:0};
    arr.push(u);
  }
  u.value = value;
  return u;
}

app.get('/queue',(req,res)=>res.json(queue));
app.get('/current',(req,res)=>res.json(current));

app.get('/top',(req,res)=>{
  const sort=a=>[...a].sort((x,y)=>y.value-x.value);
  res.json({win:sort(stats.win),like:sort(stats.like),gift:sort(stats.gift)});
});

app.post('/result',(req,res)=>{
  const {user, win}=req.body;

  if(win!=="0"){
    let u = stats.win.find(x=>x.name===user.name);
    if(!u){
      stats.win.push({name:user.name, avatar:user.avatar, value:parseFloat(win)});
    }else{
      u.value += parseFloat(win);
    }
  }

  current = null;
  res.json({ok:true});
});

app.listen(3000, ()=>console.log("SERVER OK"));

const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktok = null;
const USERNAME = "peleng____sarhan";

async function startConnection(){
  try{
    console.log("🔄 TikTok qoşulur...");
    tiktok = new WebcastPushConnection(USERNAME);

    bindEvents();

    await tiktok.connect();
    console.log("✅ TikTok Qoşuldu");
  }catch(e){
    console.log("❌ TikTok ERROR:", e.message);
    setTimeout(startConnection,5000);
  }
}

function bindEvents(){
  if(!tiktok) return;

  tiktok.on('disconnected', ()=>{
    console.log("⚠️ DISCONNECTED - yenidən qoşulur...");
    setTimeout(startConnection,3000);
  });

  // ✅ TRUE LIKE (NO LIMIT)
  tiktok.on('like', data=>{
    const user={name:data.uniqueId, avatar:data.profilePictureUrl};

    let inc = data.likeCount;

    // fallback
    if(typeof inc !== "number" || inc <= 0){
      inc = 1;
    }

    likeValue[user.name] = (likeValue[user.name] || 0) + inc;
    let total = likeValue[user.name];

    upsert(stats.like,user.name,user.avatar,total);

    let level = Math.floor(total / 500);
    let prevLevel = likeLevel[user.name] || 0;

    if(level > prevLevel){
      queue.push(user);
      likeLevel[user.name] = level;
    }
  });

  // GIFT
  tiktok.on('gift', data=>{
    const user={name:data.uniqueId, avatar:data.profilePictureUrl};

    if(data.repeatEnd !== true) return;

    let inc = data.repeatCount || 1;

    giftValue[user.name] = (giftValue[user.name] || 0) + inc;
    let total = giftValue[user.name];

    upsert(stats.gift,user.name,user.avatar,total);

    let level = Math.floor(total / 50);
    let prevLevel = giftLevel[user.name] || 0;

    if(level > prevLevel){
      queue.push(user);
      giftLevel[user.name] = level;
    }
  });
}

setInterval(()=>{
  if(!current && queue.length){
    current = queue.shift();
  }
},2000);

startConnection();
