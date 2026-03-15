
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const tiktokUsername = "xeberx.az";
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then(() => {
  console.log("Connected to TikTok live:", tiktokUsername);
}).catch(err => console.error(err));

tiktok.on("gift", data => {
  if(data.diamondCount >= 100){
    io.emit("spin", {user: data.uniqueId});
  }
});

io.on("connection", socket => {
  console.log("Client connected");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
