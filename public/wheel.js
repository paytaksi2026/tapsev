
const socket = io();

const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const result=document.getElementById("result");
const bigUser=document.getElementById("bigUser");
const winnerList=document.getElementById("winnerList");

const topWinners=document.getElementById("topWinners");
const topLikes=document.getElementById("topLikes");
const topGifts=document.getElementById("topGifts");

const segments=[
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","0","0","0","0","0","0",
"0","0","1","1","1","1","2","2","3","JACKPOT"
];

const total=segments.length;
const arc=(Math.PI*2)/total;

let rotation=0;
let spinning=false;
let spinQueue=[];

function drawWheel(){
ctx.clearRect(0,0,720,720);

for(let i=0;i<total;i++){
ctx.beginPath();
ctx.moveTo(360,360);
ctx.arc(360,360,360,i*arc,(i+1)*arc);

if(segments[i]==="JACKPOT"){
ctx.fillStyle="#FFD700";
}else{
ctx.fillStyle=`hsl(${i*12},85%,55%)`;
}

ctx.fill();

ctx.save();
ctx.translate(360,360);
ctx.rotate(i*arc+arc/2);

ctx.fillStyle="#000";
ctx.font="bold 36px Arial";
ctx.textAlign="center";
ctx.fillText(segments[i],260,10);

ctx.restore();
}
}
drawWheel();

function easeOut(t){
return 1-Math.pow(1-t,3);
}

function showUser(user){
bigUser.innerText=user+" üçün çarx fırlanır";
}

function addWinner(user,prize){
const li=document.createElement("li");
li.innerText=user+" → "+prize+" AZN";
winnerList.prepend(li);

while(winnerList.children.length>5){
winnerList.removeChild(winnerList.lastChild);
}
}

function updateList(el,data,label){
el.innerHTML="";
data.forEach(d=>{
const li=document.createElement("li");
li.innerText=d.user+" — "+d.value+" "+label;
el.appendChild(li);
});
}

socket.on("leaderboards",(data)=>{
updateList(topWinners,data.winners,"AZN");
updateList(topLikes,data.likes,"like");
updateList(topGifts,data.gifts,"diamond");
});

function runQueue(){
if(spinning || spinQueue.length===0) return;
const job=spinQueue.shift();
spin(job.user);
}

function spin(user){

spinning=true;
showUser(user);

/* random spin only for animation */
let spinAngle=360*(7 + Math.random()*2);

let duration=15000;
let start=null;

function animate(t){
if(!start) start=t;

let progress=(t-start)/duration;
if(progress>1) progress=1;

let eased=easeOut(progress);
let angle=spinAngle*eased;

canvas.style.transform=`rotate(${rotation+angle}deg)`;

if(progress<1){
requestAnimationFrame(animate);
}else{

rotation+=spinAngle;
spinning=false;

/* ===== REAL PRIZE CALCULATION FROM POINTER ===== */

/* normalize rotation */
let deg = ((rotation % 360) + 360) % 360;

/* pointer is pointing DOWN (90deg) */
let pointerAngle = 0;

/* segment angle */
let seg = 360/total;

/* calculate index under pointer */
let index = Math.floor((((360 - deg + pointerAngle) % 360) + seg/2) / seg) % total;
let prize = segments[index];

/* ===== RESULT ===== */

if(prize==="JACKPOT"){
result.innerHTML="🔥 MEGA JACKPOT 5 AZN";
addWinner(user,"JACKPOT");
}else{
result.innerHTML=user+" qazandı "+prize+" AZN";
addWinner(user,prize);
}

bigUser.innerText=user+" qazandı "+prize+" AZN";

/* notify server for leaderboard */
socket.emit("recordWin",{user:user,prize:prize==="JACKPOT"?5:prize});

runQueue();
}
}

requestAnimationFrame(animate);
}

socket.on("giftSpin",(data)=>{
for(let i=0;i<data.spins;i++){
spinQueue.push({user:data.user});
}
runQueue();
});

const liveStatus = document.getElementById("liveStatus");

socket.on("liveConnected", () => {
  if(liveStatus){
    liveStatus.innerHTML = "🟢 LIVE QOŞULDU";
    liveStatus.style.background = "#030";
  }
});
