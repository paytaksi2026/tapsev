const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let raceStarted = false;
let countdown = 10;

io.on("connection",(socket)=>{

    socket.on("join",(user)=>{
        if(players.length < 5 && !raceStarted){
            players.push({...user, position:0, speed:0});
        }
    });

});

setInterval(()=>{
    if(players.length === 5 && !raceStarted){
        countdown--;
        io.emit("countdown", countdown);

        if(countdown <= 0){
            raceStarted = true;
        }
    }

    if(raceStarted){
        players.forEach(p=>{
            p.speed = 5; // fixed to finish ~13 sec
            p.position += p.speed;
        });

        let winner = players.find(p=>p.position >= 1000);
        if(winner){
            io.emit("winner", winner.username);
            raceStarted = false;
            players = [];
            countdown = 10;
        }
    }

    io.emit("update",{players, raceStarted});
},100);

server.listen(3000);
