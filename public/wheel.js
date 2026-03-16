
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const spinSound=document.getElementById("spinSound");
const winSound=document.getElementById("winSound");

const segments=44;
const values=[
...Array(37).fill("0 AZN"),
...Array(4).fill("1 AZN"),
...Array(2).fill("2 AZN"),
"3 AZN"
];

let angle=0;
let serverResult=null;

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

function spin(user="User"){

document.getElementById("spinInfo").innerText="🎡 Çarx "+user+" üçün fırlanır";

spinSound.play();

let duration=15000;
let start=Date.now();

function frame(){

let t=(Date.now()-start)/duration;

if(t<1){

angle+=0.35*(1-t);
draw();
requestAnimationFrame(frame);

}else{

spinSound.pause();
finish();

}

}

frame();

}

function finish(){

let resultText = (serverResult ?? 0) + " AZN";

if(resultText==="0 AZN"){

document.getElementById("result").innerText="😢 Uduzdunuz";

}else{

winSound.play();
document.getElementById("result").innerText="🎉 Qazandınız: "+resultText;

}

countdown();

}

function countdown(){

let t=10;

let el=document.getElementById("countdown");

let i=setInterval(()=>{

el.innerText="Növbəti spin "+t;

t--;

if(t<0){

clearInterval(i);
el.innerText="";

}

},1000);

}

window.spin=spin;

const socket = io();

socket.on("spinStart",(data)=>{
  spin(data.user);
});

socket.on("spinResult",(data)=>{
  serverResult = data.result;
});

socket.on("queueUpdate",(q)=>{

let html="";

q.forEach((u,i)=>{
 html += (i+1)+". "+u+"<br>";
});

document.getElementById("queuePanel").innerHTML = html || "Empty";

});

socket.on("lastWinners",(list)=>{

let html="";

list.forEach((w,i)=>{
 html += (i+1)+". "+w.user+" — "+w.result+" AZN<br>";
});

document.getElementById("winnersPanel").innerHTML = html || "No winners yet";

});

socket.on("topLike",(list)=>{

let html="";
list.forEach((u,i)=>{
 html += (i+1)+". "+u[0]+" "+u[1]+"<br>";
});

document.getElementById("topLike").innerHTML = html || "No data";

});

socket.on("topGift",(list)=>{

let html="";
list.forEach((u,i)=>{
 html += (i+1)+". "+u[0]+" "+u[1]+"<br>";
});

document.getElementById("topGift").innerHTML = html || "No data";

});
