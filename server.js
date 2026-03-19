
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let raceStarted = false;

// TikTok username
const tiktokUsername = "xeberx.az";
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then(()=>{
    console.log("TikTok LIVE connected");
}).catch(err=>{
    console.log("TikTok connect error", err);
});

// TikTok EVENTS
tiktok.on('like', data=>{
    let username = data.uniqueId;
    addOrBoost(username, 0.2);
});

tiktok.on('gift', data=>{
    let username = data.uniqueId;
    addOrBoost(username, 2);
});

function addOrBoost(username, power){
    let p = players.find(x=>x.username===username);

    if(!p && players.length < 5 && !raceStarted){
        players.push({username, progress:0, speed:1});
        io.emit('players', players);

        if(players.length === 5){
            startRace();
        }
    }

    if(p){
        p.speed += power;
    }
}

function startRace(){
    raceStarted = true;
    io.emit('countdown');

    setTimeout(()=>{
        let time = 0;
        let interval = setInterval(()=>{
            time++;

            players.forEach(p=>{
                p.progress += p.speed * 0.5;
            });

            io.emit('update', players);

            if(time >= 180){
                let winner = players.sort((a,b)=>b.progress-a.progress)[0];
                io.emit('winner', winner);
                clearInterval(interval);
                players = [];
                raceStarted = false;
            }
        },1000);
    },10000);
}

server.listen(process.env.PORT || 3000, ()=>{
    console.log("Server running");
});
