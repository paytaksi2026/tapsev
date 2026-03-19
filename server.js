
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = [];
let raceStarted = false;

// gift power map
const giftPower = {
  "Rose": 1,
  "TikTok": 2,
  "Finger Heart": 3,
  "Perfume": 5,
  "Lion": 10
};

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("TikTok connected"))
.catch(err=>console.log(err));

// LIKE → join if >=1000
let likeCounter = {};

tiktok.on('like', data=>{
    const u = data.uniqueId;
    likeCounter[u] = (likeCounter[u] || 0) + data.likeCount;

    if(likeCounter[u] >= 1000){
        joinPlayer(u, data.profilePictureUrl);
    }

    boost(u, 0.2);
});

// GIFT → join if >=10
let giftCounter = {};

tiktok.on('gift', data=>{
    const u = data.uniqueId;
    giftCounter[u] = (giftCounter[u] || 0) + 1;

    if(giftCounter[u] >= 10){
        joinPlayer(u, data.profilePictureUrl);
    }

    let power = giftPower[data.giftName] || 2;
    boost(u, power);
});

function joinPlayer(username, avatar){
    if(players.find(p=>p.username===username)) return;

    if(players.length < 5 && !raceStarted){
        players.push({
            username,
            avatar,
            progress:0,
            speed:1
        });

        io.emit('players', players);

        if(players.length === 5){
            startRace();
        }
    }
}

function boost(username, power){
    let p = players.find(x=>x.username===username);
    if(p) p.speed += power;
}

function startRace(){
    raceStarted = true;
    io.emit('countdown');

    setTimeout(()=>{
        let time = 0;

        let interval = setInterval(()=>{
            time++;

            players.forEach(p=>{
                p.progress += p.speed * 0.3;
            });

            io.emit('update', players);

            if(time >= 180){
                clearInterval(interval);
                io.emit('finish');
                players=[];
                raceStarted=false;
            }
        },1000);

    },10000);
}

server.listen(process.env.PORT || 3000);
