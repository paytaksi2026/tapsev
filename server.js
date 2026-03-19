// Advanced server with TikTok mock + race engine
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let queue = [];
let connected = false;
let timer = 180;

function startRace(){
    timer = 180;
    const interval = setInterval(()=>{
        players.forEach(p=>{
            p.position += p.speed;
        });

        timer--;

        if(timer <= 0){
            clearInterval(interval);
            players.sort((a,b)=>b.position-a.position);
            io.emit('raceEnd', players.slice(0,15));
            players = [];
            players = queue.splice(0,5);
        }

        io.emit('update', {players, timer});
    },1000);
}

io.on('connection', (socket)=>{

    socket.emit('status', connected);

    socket.on('join',(user)=>{
        if(players.length < 5){
            players.push({ ...user, position:0, speed:1 });
            if(players.length === 5) startRace();
        }else{
            queue.push(user);
            socket.emit('queue', queue.length);
        }
    });

    socket.on('like',(username)=>{
        players.forEach(p=>{
            if(p.username===username) p.speed += 1;
        });
    });

    socket.on('gift',(data)=>{
        players.forEach(p=>{
            if(p.username===data.username){
                p.speed += data.power;
            }
        });
    });

});

// simulate TikTok connection
setTimeout(()=>{ connected = true; },3000);

server.listen(3000, ()=>console.log("running"));
