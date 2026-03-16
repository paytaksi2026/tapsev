
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

function draw(){

const cx=325;
const cy=325;
const r=300;

ctx.clearRect(0,0,650,650);

for(let i=0;i<segments;i++){

let start=(i*(Math.PI*2)/segments)+angle;
let end=start+(Math.PI*2)/segments;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

ctx.fillStyle=i%2?"#FFD700":"#111";
ctx.fill();

ctx.save();
ctx.translate(cx,cy);
ctx.rotate(start+(Math.PI/segments));

ctx.fillStyle="#fff";
ctx.font="bold 20px Arial";
ctx.fillText(values[i],200,5);

ctx.restore();

}

}

draw();

function spin(user="User"){

document.getElementById("spinInfo").innerText="🎡 "+user+" üçün çarx fırlanır";

spinSound.play();

let duration=15000;
let start=Date.now();

function frame(){

let t=(Date.now()-start)/duration;

if(t<1){

angle+=0.4*(1-t);
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

let result=values[Math.floor(Math.random()*values.length)];

const el=document.getElementById("result");

if(result==="0 AZN"){
el.innerText="😢 Uduzdunuz";
}else{
winSound.play();
el.innerText="🎉 QAZANDINIZ "+result;
}

setTimeout(()=>{
el.innerText="";
},10000);

countdown();

}

function countdown(){

let t=10;
let el=document.getElementById("countdown");

let i=setInterval(()=>{

el.innerText="⏳ Növbəti spin "+t;
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

socket.on("topLike",(list)=>{

let html="";
list.forEach((u,i)=>{
html+=(i+1)+". "+u[0]+" "+u[1]+"<br>";
});

document.getElementById("topLike").innerHTML=html||"No data";

});

socket.on("topGift",(list)=>{

let html="";
list.forEach((u,i)=>{
html+=(i+1)+". "+u[0]+" "+u[1]+"<br>";
});

document.getElementById("topGift").innerHTML=html||"No data";

});

socket.on("topWinners",(list)=>{

let html="";
list.forEach((u,i)=>{
html+=(i+1)+". "+u.user+" "+u.prize+" AZN<br>";
});

document.getElementById("topWinners").innerHTML=html||"No data";

});
