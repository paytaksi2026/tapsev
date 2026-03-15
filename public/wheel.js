
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const result=document.getElementById("result");
const spinBtn=document.getElementById("spinBtn");
const spinSound=document.getElementById("spinSound");

const segments=[
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","1","1","1","2","3","JACKPOT"
];

const total=segments.length;
const arc=(Math.PI*2)/total;

let rotation=0;
let spinning=false;

function drawWheel(){

ctx.clearRect(0,0,700,700);

for(let i=0;i<total;i++){

ctx.beginPath();
ctx.moveTo(350,350);
ctx.arc(350,350,350,i*arc,(i+1)*arc);

if(segments[i]==="JACKPOT"){
ctx.fillStyle="#FFD700";
}else{
ctx.fillStyle=`hsl(${i*12},85%,55%)`;
}

ctx.fill();

ctx.save();
ctx.translate(350,350);
ctx.rotate(i*arc+arc/2);

ctx.fillStyle="#000";
ctx.font="bold 36px Arial";
ctx.textAlign="center";
ctx.fillText(segments[i],250,10);

ctx.restore();

}
}

drawWheel();

function spin(){

if(spinning) return;

spinning=true;
if(spinSound) spinSound.play();

let spinAngle=Math.random()*360+2000;
let duration=15000;
let start=null;

function animate(t){

if(!start) start=t;

let progress=t-start;

let angle=spinAngle*(progress/duration);

canvas.style.transform=`rotate(${rotation+angle}deg)`;

if(progress<duration){

requestAnimationFrame(animate);

}else{

rotation+=spinAngle;

spinning=false;

showResult();

}

}

requestAnimationFrame(animate);

}

function showResult(){

let normalized=(rotation%360);

let index=Math.floor((360-normalized)/(360/total))%total;

let prize=segments[index];

if(prize==="JACKPOT"){

result.innerHTML="🔥 MEGA JACKPOT 5 AZN";

confetti({
particleCount:200,
spread:120,
origin:{y:0.6}
});

}else{

result.innerHTML="QAZANDI: "+prize+" AZN";

confetti({
particleCount:120,
spread:80,
origin:{y:0.6}
});

}

}

spinBtn.onclick=spin;
