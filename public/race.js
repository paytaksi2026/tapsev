const socket = io();
const c = document.getElementById("c");
const ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

let players = [];
let images = {};

socket.on("update",(data)=>{
    players = data.players || [];
    applySmartBoost();
    draw();
});

socket.on("winner",(p)=>{
    showWinner(p);
    confetti();
});

function loadAvatar(url,u){
    if(images[u]) return;
    let img = new Image();
    img.src = url;
    images[u]=img;
}

function draw(){
    ctx.fillStyle="#0a0";
    ctx.fillRect(0,0,c.width,c.height);

    // road
    ctx.fillStyle="#444";
    ctx.fillRect(0,200,c.width,200);

    // finish
    ctx.fillStyle="white";
    ctx.fillRect(c.width-120,200,10,200);

    players.forEach((p,i)=>{
        let y = 220 + i*50;

        loadAvatar(p.avatar,p.username);

        // car
        ctx.fillStyle="red";
        ctx.fillRect(p.position,y,80,40);

        // avatar
        if(images[p.username]){
            ctx.drawImage(images[p.username],p.position+20,y+5,30,30);
        }

        // gift type effect
        if(p.lastGift === "diamond"){
            ctx.fillStyle="cyan";
            ctx.fillRect(p.position,y-10,20,5);
        }

        // flame
        if(p.speed > 5){
            ctx.fillStyle="orange";
            ctx.beginPath();
            ctx.arc(p.position-10,y+20,10,0,Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-5);
    });
}

function showWinner(name){
    let w = document.getElementById("winner");
    w.style.display="block";
    w.innerText = "👑 QALİB: "+name;
}

function confetti(){
    for(let i=0;i<100;i++){
        ctx.fillStyle = "hsl("+Math.random()*360+",100%,50%)";
        ctx.fillRect(Math.random()*c.width,Math.random()*c.height,5,5);
    }
}

// engagement hack
function applySmartBoost(){
    if(players.length<2) return;

    let min = players.reduce((a,b)=>a.position<b.position?a:b);

    min.speed += 0.5; // losing player boost
}
