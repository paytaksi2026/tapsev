const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

let users = {}; // username -> balance
let leaderboard = [];

function addBalance(user, amount){
    if(!users[user]) users[user] = 0;
    users[user] += amount;
}

function saveWinner(user, amount){
    leaderboard.push({user, amount, date:Date.now()});
    addBalance(user, amount);
}

app.get("/api/balance/:user",(req,res)=>{
    res.json({balance: users[req.params.user] || 0});
});

app.get("/api/top",(req,res)=>{
    res.json(leaderboard.slice(-15).reverse());
});

app.post("/api/admin/reward",(req,res)=>{
    const {user, amount} = req.body;
    addBalance(user, amount);
    res.json({ok:true});
});

io.on("connection",(socket)=>{
    socket.on("winner",(data)=>{
        saveWinner(data.user, data.amount);
    });
});

server.listen(3000);
