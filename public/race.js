const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = [];
let gifts = 0;

socket.on("update", data=>{
    players = data.players;
    gifts = data.totalGifts;
    draw();
    updateLeaderboard();
});

function draw(){
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // road
    ctx.fillStyle="#333";
    ctx.fillRect(0,100,canvas.width,300);

    // finish
    ctx.fillStyle="white";
    ctx.fillRect(canvas.width-150,100,10,300);

    players.forEach((p,i)=>{
        let y = 120 + i*60;

        // car sprite (rectangle placeholder)
        ctx.fillStyle="red";
        ctx.fillRect(p.position,y,100,50);

        // nitro effect
        if(p.speed > 5){
            ctx.fillStyle="orange";
            ctx.fillRect(p.position-20,y+15,20,20);
        }

        // username
        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-5);
    });
}

function updateLeaderboard(){
    let lb = document.getElementById("leaderboard");
    lb.innerHTML = "<b>TOP 15</b><br>";
    players.sort((a,b)=>b.position-a.position);
    players.slice(0,15).forEach((p,i)=>{
        lb.innerHTML += (i+1)+". "+p.username+"<br>";
    });
}
