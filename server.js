
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
let winners = [];
let raceStarted = false;

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("LIVE OK"));

tiktok.on('like', data=>{
    const u = data.uniqueId;

    if(!players.find(p=>p.username===u)){
        players.push({username:u,avatar:data.profilePictureUrl,progress:0,speed:1});
    }

    players.forEach(p=>{
        if(p.username===u) p.speed += 0.5;
    });

    io.emit('players', players);
});

tiktok.on('gift', data=>{
    const u = data.uniqueId;

    if(!players.find(p=>p.username===u)){
        players.push({username:u,avatar:data.profilePictureUrl,progress:0,speed:1});
    }

    players.forEach(p=>{
        if(p.username===u) p.speed += 2;
    });

    io.emit('players', players);
});

function startRace(){
    raceStarted = true;
    io.emit('countdown');

    setTimeout(()=>{
        let t=0;
        let int=setInterval(()=>{
            t++;

            players.forEach(p=>{
                p.progress += p.speed;
            });

            io.emit('update',players);

            if(t>=180){
                clearInterval(int);

                let winner = players.sort((a,b)=>b.progress-a.progress)[0];
                winners.push(winner);
                winners = winners.slice(-10);

                io.emit('winners', winners);

                players=[];
                raceStarted=false;
            }

        },1000);

    },10000);
}

setInterval(()=>{
    if(players.length>=2 && !raceStarted){
        startRace();
    }
},3000);

server.listen(process.env.PORT||3000);
