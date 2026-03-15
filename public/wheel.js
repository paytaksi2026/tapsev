const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const result=document.getElementById("result");
const spinBtn=document.getElementById("spinBtn");

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

ctx.clearRect(0,0,650,650);

for(let i=0;i<total;i++){

ctx.beginPath();
ctx.moveTo(325,325);
ctx.arc(325,325,325,i*arc,(i+1)*arc);
ctx.fillStyle=`hsl(${i*12},80%,55%)`;
ctx.fill();

ctx.save();
ctx.translate(325,325);
ctx.rotate(i*arc+arc/2);

ctx.fillStyle="black";
ctx.font="bold 34px Arial";
ctx.textAlign="center";
ctx.fillText(segments[i],220,10);

ctx.restore();
}
}

drawWheel();

function spin(){

if(spinning) return;

spinning=true;

let spinAngle=Math.random()*360+1800;
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
}else{
result.innerHTML="QAZANDI: "+prize+" AZN";
}

}

spinBtn.onclick=spin;
