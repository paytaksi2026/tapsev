const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = [];
let queue = [];

const engine = document.getElementById("engine");
const boostSound = document.getElementById("boost");

engine.volume = 0.3;
engine.play();

setInterval(()=>{
    document.getElementById("popup").style.display = "block";
    setTimeout(()=>{document.getElementById("popup").style.display="none"},2000);
},5000);

socket.on("update", data=>{
    players = data.players || [];
    queue = data.queue || [];
    draw();
    updateQueue();
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
        let y = 120 + i*80;

        // car
        ctx.fillStyle="red";
        ctx.fillRect(p.position,y,120,50);

        // nitro flame
        if(p.speed > 5){
            ctx.fillStyle="orange";
            ctx.beginPath();
            ctx.arc(p.position-10,y+25,15,0,Math.PI*2);
            ctx.fill();
            boostSound.play();
        }

        // username
        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-10);

        // finish check
        if(p.position > canvas.width-160){
            showWinner(p.username);
        }

        // engine sound speed
        engine.playbackRate = 1 + (p.speed/10);
    });
}

function showWinner(name){
    ctx.fillStyle="yellow";
    ctx.font="40px Arial";
    ctx.fillText("🏆 QALİB: "+name, canvas.width/2-150, 80);
}

function updateQueue(){
    let q = document.getElementById("queue");
    q.innerHTML = "<b>QUEUE</b><br>";
    queue.forEach((u,i)=>{
        q.innerHTML += (i+1)+". "+u.username+"<br>";
    });
}
