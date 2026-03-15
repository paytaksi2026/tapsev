
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const TIKTOK_USERNAME = "xeberx.az";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use("/admin", express.static("admin"));

let queue = [];
let spinning = false;

let likeCounter = {};
let giftCounter = {};

function getRandomSegment(){
  const segments=[
    ...Array(37).fill(0),
    ...Array(4).fill(1),
    ...Array(2).fill(2),
    3
  ];
  return segments[Math.floor(Math.random()*segments.length)];
}

function processQueue(){

  if(spinning) return;
  if(queue.length === 0) return;

  spinning = true;

  const user = queue.shift();
  io.emit("queueUpdate", queue);

  const result = getRandomSegment();

  io.emit("spinStart",{user,result});

  setTimeout(()=>{

    io.emit("spinResult",{user,result});

    spinning = false;

    setTimeout(processQueue,10000);

  },15000);

}

/* SOCKET TEST SUPPORT */

io.on("connection",(socket)=>{

  socket.on("addLike",(user)=>{
    likeCounter[user] = (likeCounter[user]||0)+1;

    if(likeCounter[user] >= 100){
      likeCounter[user] = 0;
      queue.push(user);
      io.emit("queueUpdate",queue);
      processQueue();
    }
  });

  socket.on("addGift",(user)=>{
    giftCounter[user] = (giftCounter[user]||0)+1;

    if(giftCounter[user] >= 100){
      giftCounter[user] = 0;
      queue.push(user);
      io.emit("queueUpdate",queue);
      processQueue();
    }
  });

});

/* TIKTOK LIVE CONNECTOR */

const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect().then(state => {
    console.log("Connected to TikTok LIVE:", state.roomId);
}).catch(err => {
    console.error("TikTok connection failed", err);
});

tiktokLiveConnection.on("like", data => {

  const user = data.uniqueId;

  likeCounter[user] = (likeCounter[user]||0) + data.likeCount;

  if(likeCounter[user] >= 100){

    likeCounter[user] = 0;

    queue.push(user);

    io.emit("queueUpdate", queue);

    processQueue();

  }

});

tiktokLiveConnection.on("gift", data => {

  const user = data.uniqueId;

  giftCounter[user] = (giftCounter[user]||0) + 1;

  if(giftCounter[user] >= 100){

    giftCounter[user] = 0;

    queue.push(user);

    io.emit("queueUpdate", queue);

    processQueue();

  }

});

server.listen(3000,()=>{
 console.log("Server running with TikTok connector");
});
