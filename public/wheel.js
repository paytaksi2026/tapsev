
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const spinSound=document.getElementById("spinSound");
const winSound=document.getElementById("winSound");
const tickSound=document.getElementById("tickSound"); // NEW

const segments=44;

const values=["0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","2 AZN","0 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","0 AZN","0 AZN","3 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","2 AZN","0 AZN","0 AZN","0 AZN","0 AZN","1 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN","0 AZN"];

const segmentAngle=(Math.PI*2)/segments;

let angle=0;
let spinning=false;

let ledOffset=0; // LED animation
let winnerIndex=null; // highlight winner

function draw(){

const cx=300;
const cy=300;
const r=250;

ctx.clearRect(0,0,600,600);

/* LED RING */
for(let i=0;i<segments;i++){
let a=i*segmentAngle;
let x=cx+Math.cos(a)*290;
let y=cy+Math.sin(a)*290;

ctx.beginPath();
ctx.arc(x,y,6,0,Math.PI*2);
ctx.fillStyle=(i+ledOffset)%2 ? "#fff200" : "#444";
ctx.fill();
}

/* OUTER GOLD RING */
ctx.beginPath();
ctx.arc(cx,cy,280,0,Math.PI*2);
ctx.fillStyle="#d4af37";
ctx.fill();

/* METAL TEETH */
for(let i=0;i<segments;i++){

let a=i*segmentAngle+angle;

let x=cx+Math.cos(a)*285;
let y=cy+Math.sin(a)*285;

ctx.beginPath();
ctx.arc(x,y,6,0,Math.PI*2);
ctx.fillStyle="#bbb";
ctx.fill();

}

/* SEGMENTS */
for(let i=0;i<segments;i++){

let start=(i*segmentAngle)+angle;
let end=start+segmentAngle;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

let grad=ctx.createLinearGradient(0,0,600,600);
grad.addColorStop(0,i%2?"#111":"#d4af37");
grad.addColorStop(1,i%2?"#333":"#ffd700");

ctx.fillStyle=grad;
ctx.fill();

/* WINNER GLOW */
if(i===winnerIndex){
ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);
ctx.fillStyle="rgba(255,255,255,0.35)";
ctx.fill();
}

ctx.save();

ctx.translate(cx,cy);
ctx.rotate(start+(segmentAngle/2));

ctx.fillStyle="white";
ctx.font="bold 20px Arial";
ctx.textAlign="center";
ctx.fillText(values[i],170,8);

ctx.restore();

}

/* CENTER HUB */
ctx.beginPath();
ctx.arc(cx,cy,60,0,Math.PI*2);
ctx.fillStyle="#111";
ctx.fill();
ctx.lineWidth=4;
ctx.strokeStyle="gold";
ctx.stroke();

}

draw();

function spinTo(user,result){

if(spinning) return;
spinning=true;

winnerIndex=null;

document.getElementById("spinInfo").innerText="🎡 Çarx "+user+" üçün fırlanır";

spinSound.play();

let resultText=result+" AZN";

let indexes=[];

for(let i=0;i<values.length;i++){
 if(values[i]===resultText) indexes.push(i);
}

let index=indexes[Math.floor(Math.random()*indexes.length)];

let target=(segments-index)*segmentAngle - Math.PI/2;
target+=Math.PI*8;

let startAngle=angle;
let start=Date.now();
let duration=7000;

function frame(){

let t=(Date.now()-start)/duration;

if(t<1){

angle=startAngle+(target-startAngle)*(1-Math.pow(1-t,4));

// tick sound when passing segments
if(tickSound && Math.random()<0.2){
try{ tickSound.currentTime=0; tickSound.play(); }catch(e){}
}

draw();
requestAnimationFrame(frame);

}else{

angle=target;
winnerIndex=index;

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

// LED animation loop
setInterval(()=>{
ledOffset++;
draw();
},200);
