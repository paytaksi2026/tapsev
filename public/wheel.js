
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const spinSound=document.getElementById("spinSound");
const winSound=document.getElementById("winSound");

const segments=44;

const values=["0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","2 AZN","0 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","0 AZN","0 AZN","3 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","2 AZN","0 AZN","0 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN"];

const segmentAngle=(Math.PI*2)/segments;

let angle=0;
let spinning=false;

function draw(){
const cx=300;
const cy=300;
const r=280;

ctx.clearRect(0,0,600,600);

for(let i=0;i<segments;i++){

let start=(i*segmentAngle)+angle;
let end=start+segmentAngle;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

ctx.fillStyle=i%2?"#d4af37":"#222";
ctx.fill();

ctx.save();

ctx.translate(cx,cy);
ctx.rotate(start+(segmentAngle/2));

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.fillText(values[i],180,5);

ctx.restore();

}
}

draw();

function spinTo(user,result){

if(spinning) return;
spinning=true;

document.getElementById("spinInfo").innerText="🎡 Çarx "+user+" üçün fırlanır";

spinSound.play();

let resultText=result+" AZN";

let indexes=[];

for(let i=0;i<values.length;i++){
 if(values[i]===resultText) indexes.push(i);
}

let index=indexes[Math.floor(Math.random()*indexes.length)];

let target=(segments-index)*segmentAngle;

target+=Math.PI*6;

let startAngle=angle;
let start=Date.now();
let duration=5000;

function frame(){

let t=(Date.now()-start)/duration;

if(t<1){

angle=startAngle+(target-startAngle)*(1-Math.pow(1-t,3));

draw();
requestAnimationFrame(frame);

}else{

angle=target;
draw();

finish(result);

spinning=false;

}

}

frame();

}

function finish(result){

spinSound.pause();

let resultText=result+" AZN";

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

const socket=io();

socket.on("spinStart",(data)=>{
 spinTo(data.user,data.result);
});

socket.on("queueUpdate",(q)=>{

let html="";

q.forEach((u,i)=>{
 html+=(i+1)+". "+u+"<br>";
});

document.getElementById("queuePanel").innerHTML=html||"Empty";

});

socket.on("lastWinners",(list)=>{

let html="";

list.forEach((w,i)=>{
 html+=(i+1)+". "+w.user+" — "+w.result+" AZN<br>";
});

document.getElementById("winnersPanel").innerHTML=html||"No winners yet";

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
