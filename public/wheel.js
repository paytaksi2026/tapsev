
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");

const socket = io();

const segments = [
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","1","1","1","2","3","JACKPOT"
];

let angle = 0;
let spinning = false;

function drawWheel(){
const arc = Math.PI*2/segments.length;
for(let i=0;i<segments.length;i++){
ctx.beginPath();
ctx.fillStyle = `hsl(${i*12},80%,50%)`;
ctx.moveTo(250,250);
ctx.arc(250,250,250,i*arc,(i+1)*arc);
ctx.fill();

ctx.save();
ctx.translate(250,250);
ctx.rotate(i*arc+arc/2);
ctx.fillStyle="white";
ctx.fillText(segments[i],150,0);
ctx.restore();
}
}

drawWheel();

function spin(user=""){
if(spinning) return;
spinning=true;

let spinTime=15000;
let start=Date.now();

let spinInterval=setInterval(()=>{
angle+=0.3;
canvas.style.transform=`rotate(${angle}rad)`;

if(Date.now()-start>spinTime){
clearInterval(spinInterval);
spinning=false;

let index = Math.floor(Math.random()*segments.length);
let prize = segments[index];

resultDiv.innerHTML = user + " qazandı: " + prize + " AZN";
}
},30);
}

spinBtn.onclick=()=>spin("Manual");

socket.on("spin", data=>{
spin("@"+data.user);
});
