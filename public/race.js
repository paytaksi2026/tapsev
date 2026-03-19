const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let players = [];

socket.on("status",(s)=>{
    document.getElementById("status").innerText = s ? "🟢 CONNECTED" : "🔴 NOT CONNECTED";
});

socket.on("update",(data)=>{
    players = data.players;
    draw();
});

socket.on("raceEnd",(top)=>{
    alert("Winner: "+top[0].username);
});

function draw(){
    ctx.clearRect(0,0,800,400);

    players.forEach((p,i)=>{
        ctx.fillStyle="red";
        ctx.fillRect(p.position, i*70+50, 60,30);
        ctx.fillStyle="white";
        ctx.fillText(p.username, p.position, i*70+40);
    });
}

// demo join
setTimeout(()=>{
    socket.emit("join",{username:"player"+Math.random().toFixed(3)});
},1000);

// simulate actions
setInterval(()=>{
    if(players[0]){
        socket.emit("like", players[0].username);
    }
},2000);
