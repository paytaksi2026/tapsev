const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    players[socket.id] = { username, hp: 100 };
    io.emit("update", players);
  });

  socket.on("gift", () => {
    if(players[socket.id]){
      players[socket.id].hp += 10;
      io.emit("update", players);
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update", players);
  });
});

server.listen(3000, () => console.log("Server running"));
