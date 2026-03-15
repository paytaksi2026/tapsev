
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const segments=44;
const values=[
...Array(37).fill("0 AZN"),
...Array(4).fill("1 AZN"),
...Array(2).fill("2 AZN"),
"3 AZN"
];

let angle=0;

function draw(){

const cx=300;
const cy=300;
const r=280;

ctx.clearRect(0,0,600,600);

for(let i=0;i<segments;i++){

let start=(i*(Math.PI*2)/segments)+angle;
let end=start+(Math.PI*2)/segments;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

ctx.fillStyle=i%2?"#d4af37":"#222";
ctx.fill();

ctx.save();

ctx.translate(cx,cy);
ctx.rotate(start+(Math.PI/segments));

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.fillText(values[i],180,5);

ctx.restore();

}

}

draw();

function spin(){

let duration=15000;
let start=Date.now();

function frame(){

let t=(Date.now()-start)/duration;

if(t<1){

angle+=0.35*(1-t);
draw();
requestAnimationFrame(frame);

}

}

frame();

}

window.spin=spin;
