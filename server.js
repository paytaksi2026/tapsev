const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

let players = [];
let raceActive = false;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (user) => {
    if (players.length < 5 && !raceActive) {
      players.push(user);
      io.emit("players", players);
    }
  });

  socket.on("startRace", () => {
    if (players.length === 5) {
      raceActive = true;
      io.emit("raceStart");
    }
  });

  socket.on("finish", (winner) => {
    io.emit("winner", winner);
    players = [];
    raceActive = false;
  });
});

server.listen(PORT, () => {
  console.log("Server running on " + PORT);
});