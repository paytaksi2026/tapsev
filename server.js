const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const {WebcastPushConnection}=require("tiktok-live-connector");
const config=require("./config.json");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static(__dirname));

let queue=[];
let totalCoins=0;
let leaderboard={};
let likes={};
let raceActive=false;
let raceData={};

const tiktok=new WebcastPushConnection(config.tiktokUser);
tiktok.connect().then(()=>console.log("TikTok qoşuldu"));

tiktok.on("gift",(data)=>{
  let coins=data.diamondCount||0;
  let user=data.uniqueId;
  let avatar=data.profilePictureUrl;

  if(coins<10) return;

  totalCoins+=coins;

  if(!queue.find(u=>u.user===user)){
    queue.push({user,avatar,score:0});
  }

  if(raceActive && raceData[user]){
    raceData[user].score += coins*5;
    io.emit("updateProgress",raceData);
  }

  io.emit("queue",queue);

  if(queue.length>=5 && !raceActive){
    startRace();
  }
});

tiktok.on("like",(data)=>{
  let user=data.uniqueId;
  likes[user]=(likes[user]||0)+1;

  if(likes[user]>=1000){
    if(!queue.find(u=>u.user===user)){
      queue.push({user,avatar:data.profilePictureUrl,score:0});
    }
    likes[user]=0;
    io.emit("queue",queue);
  }
});

function startRace(){
  raceActive=true;
  let players=queue.splice(0,5);
  raceData={};

  players.forEach(p=>{
    raceData[p.user]={score:0,avatar:p.avatar};
  });

  io.emit("racePlayers",players);
  io.emit("raceStart");

  setTimeout(()=>{
    finishRace();
  },180000);
}

function finishRace(){
  raceActive=false;

  let winnerUser=null;
  let max=0;

  for(let u in raceData){
    if(raceData[u].score>max){
      max=raceData[u].score;
      winnerUser=u;
    }
  }

  let reward=totalCoins*0.1;
  leaderboard[winnerUser]=(leaderboard[winnerUser]||0)+1;

  io.emit("winner",{winner:{user:winnerUser},reward,leaderboard});

  totalCoins=0;
  raceData={};
}

server.listen(3000,()=>console.log("Server işləyir"));
