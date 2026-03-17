
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let queue = [];
let winners = [];
let topLikes = {};
let topGifts = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('init', { queue, winners });

  socket.on('like', (user) => {
    topLikes[user] = (topLikes[user] || 0) + 1;
  });

  socket.on('gift', (user) => {
    topGifts[user] = (topGifts[user] || 0) + 1;
    queue.push(user);
    io.emit('queue', queue);
  });

  socket.on('finishSpin', (data) => {
    winners.unshift(data);
    winners = winners.slice(0,15);
    io.emit('winners', winners);
  });
});

server.listen(3000, () => console.log('RUNNING'));
