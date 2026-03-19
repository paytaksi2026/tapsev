const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// FIX: correct static path
app.use(express.static(path.join(__dirname, 'public')));

// DB
const db = new sqlite3.Database('./race.db');
db.run(`CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    wins INTEGER DEFAULT 1,
    earnings REAL DEFAULT 0
)`);

let players = [];
let raceStarted = false;
let totalGifts = 0;

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("TikTok connected"))
.catch(err=>console.log("TikTok error:", err));

// EVENTS
tiktok.on('like', data=>{
    io.emit('like_stream', data.uniqueId);
    boost(data.uniqueId, 0.2);
});

tiktok.on('gift', data=>{
    totalGifts += 1;
    boost(data.uniqueId, 2);
});

function boost(username, power){
    let p = players.find(x=>x.username===username);

    if(!p && players.length < 5 && !raceStarted){
        players.push({username, progress:0, speed:1});
        io.emit('players', players);
        if(players.length===5) startRace();
    }

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
                p.progress += p.speed * 0.5;
            });

            io.emit('update', players);

            if(time>=180){
                let winner = players.sort((a,b)=>b.progress-a.progress)[0];

                let reward = totalGifts * 0.1;

                db.run(`INSERT INTO winners(username, earnings) VALUES(?,?)`,
                    [winner.username, reward]);

                io.emit('winner', {user:winner.username, reward});

                players=[];
                totalGifts=0;
                raceStarted=false;
                clearInterval(interval);
            }
        },1000);
    },10000);
}

app.get('/top', (req,res)=>{
    db.all(`SELECT username, COUNT(*) as wins, SUM(earnings) as earnings
            FROM winners GROUP BY username ORDER BY wins DESC LIMIT 10`,
        [], (err,rows)=>{
            res.json(rows);
        });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log("Server running on", PORT));
