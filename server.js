
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

let likeTotals = {};
let giftTotals = {};

let lastWinners = [];

function topList(obj){
  return Object.entries(obj)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);
}

function broadcastTop(){
  io.emit("topLike", topList(likeTotals));
  io.emit("topGift", topList(giftTotals));
}

function broadcastQueue(){
  io.emit("queueUpdate", queue);
}

function broadcastWinners(){
  io.emit("lastWinners", lastWinners);
}

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
  broadcastQueue();

  const result = getRandomSegment();

  io.emit("spinStart",{user,result});

  setTimeout(()=>{

    io.emit("spinResult",{user,result});

    lastWinners.unshift({user,result});
    lastWinners = lastWinners.slice(0,10);
    broadcastWinners();

    spinning = false;

    setTimeout(processQueue,10000);

  },15000);

}

const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect()
.then(state => {

console.log("Connected to TikTok LIVE:", state.roomId);
io.emit("tiktokStatus","connected");

})
.catch(err => {

console.error("TikTok connection failed", err);
io.emit("tiktokStatus","failed");

});

tiktokLiveConnection.on("like", data => {

const user = data.uniqueId;

likeTotals[user] = (likeTotals[user]||0) + data.likeCount;
broadcastTop();

likeCounter[user] = (likeCounter[user]||0) + data.likeCount;

if(likeCounter[user] >= 10){

likeCounter[user] = 0;

queue.push(user);
broadcastQueue();

processQueue();

}

});

tiktokLiveConnection.on("gift", data => {

const user = data.uniqueId;

giftTotals[user] = (giftTotals[user]||0) + 1;
broadcastTop();

giftCounter[user] = (giftCounter[user]||0) + 1;

if(giftCounter[user] >= 100){

giftCounter[user] = 0;

queue.push(user);
broadcastQueue();

processQueue();

}

});

server.listen(3000,()=>{
 console.log("Server running with TikTok connector + TOP panels + Queue + Winners");
});
