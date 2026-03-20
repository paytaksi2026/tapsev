
const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const {WebcastPushConnection}=require('tiktok-live-connector');

const app=express();
const serverHttp=http.createServer(app);
const io=new Server(serverHttp);

app.use(express.static('public'));

const USERNAME=process.env.TIKTOK_USERNAME||"xeberx.az";

let users={};
let timer=180;
let phase="game";
let pauseTime=15;
let winners=[];

let totalLikes=0;
let totalGifts=0;

const tiktok=new WebcastPushConnection(USERNAME);
tiktok.connect().then(()=>console.log("TikTok Connected"));

tiktok.on("like",data=>{
 if(phase!=="game") return;
 const u=data.uniqueId;
 if(!users[u]) users[u]={likes:0,gifts:0};
 users[u].likes+=data.likeCount||1;
 totalLikes += data.likeCount||1;
});

tiktok.on("gift",data=>{
 if(phase!=="game") return;
 const u=data.uniqueId;
 if(!users[u]) users[u]={likes:0,gifts:0};
 users[u].gifts+=data.diamondCount||1;
 totalGifts += data.diamondCount||1;
});

function explodeNow(){
 let w=Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts)[0];
 if(w){
   winners.unshift(w[0]);
   if(winners.length>10) winners.pop();
   io.emit("winner",{user:w[0],reward:0});
 }
 phase="pause";
 pauseTime=15;
}

setInterval(()=>{

 if(phase==="game"){
   timer--;

   // SMART EXPLOSION
   if(totalLikes>=10000 || totalGifts>=5000){
     explodeNow();
   }

   if(timer<=0){
     explodeNow();
   }

 } else if(phase==="pause"){
   pauseTime--;

   if(pauseTime<=0){
     users={};
     totalLikes=0;
     totalGifts=0;
     timer=180;
     phase="game";
   }
 }

 io.emit("update",{users,timer,phase,pauseTime,winners});

},1000);

serverHttp.listen(3000);
