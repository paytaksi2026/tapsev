
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let raceStarted = false;

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (user) => {
        if(players.length < 5 && !raceStarted){
            players.push({...user, progress:0, speed:0});
            io.emit('players', players);

            if(players.length === 5){
                startRace();
            }
        }
    });

    socket.on('like', (username) => {
        let p = players.find(x=>x.username===username);
        if(p) p.speed += 0.5;
    });

    socket.on('gift', (username) => {
        let p = players.find(x=>x.username===username);
        if(p) p.speed += 2;
    });
});

function startRace(){
    raceStarted = true;
    io.emit('countdown');

    setTimeout(()=>{
        let interval = setInterval(()=>{
            players.forEach(p=>{
                p.progress += p.speed;
            });

            io.emit('update', players);

            let winner = players.find(p=>p.progress >= 100);
            if(winner){
                clearInterval(interval);
                io.emit('winner', winner);
                players = [];
                raceStarted = false;
            }
        },1000);
    },10000);
}

server.listen(3000, ()=>{
    console.log('Server running');
});
