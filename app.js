
let protocol = location.protocol === "https:" ? "wss://" : "ws://";
let ws = new WebSocket(protocol + location.host);

let queue=[];
let winners={};
let likes={};
let gifts={};
let rewards={};

ws.onmessage = (e)=>{
 let data = JSON.parse(e.data);

 if(data.type==='like'){
   likes[data.user]=(likes[data.user]||0)+data.count;
   if(likes[data.user]>=1000){
     queue.push(data.user);
     likes[data.user]=0;
   }
 }

 if(data.type==='gift'){
   gifts[data.user]=(gifts[data.user]||0)+data.diamonds;
   if(gifts[data.user]>=100){
     queue.push(data.user);
     gifts[data.user]=0;
   }
 }

 updateLists();
};

function avatar(u){
 return "https://ui-avatars.com/api/?name="+u;
}

function render(id,data){
 let el=document.getElementById(id);
 el.innerHTML="";
 Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([u,v])=>{
  let li=document.createElement("li");
  li.innerHTML="<img src='"+avatar(u)+"' width=25> "+u+" ("+v+")";
  el.appendChild(li);
 });
}

function updateLists(){
 render("topLikes",likes);
 render("topGifts",gifts);
 render("winners",winners);
}

function roll(user){
 let d1=Math.floor(Math.random()*6)+1;
 let d2=Math.floor(Math.random()*6)+1;

 document.getElementById("dice1").innerText=d1;
 document.getElementById("dice2").innerText=d2;

 new Audio("sounds/dice.mp3").play();

 if(d1==6 && d2==6){
   winners[user]=(winners[user]||0)+1;
   rewards[user]=(rewards[user]||0)+1;

   document.getElementById("result").innerText="ŞEŞ QOŞA!";
   new Audio("sounds/win.mp3").play();
 } else {
   document.getElementById("result").innerText="Uduzdu";
 }
}

function processQueue(){
 if(queue.length==0)return;

 let user=queue.shift();
 let popup=document.getElementById("popup");
 let c=15;

 popup.innerText=user+" hazır ol "+c;

 let int=setInterval(()=>{
  c--;
  popup.innerText=user+" hazır ol "+c;

  if(c<=0){
    clearInterval(int);
    popup.innerText="";
    roll(user);
  }
 },1000);
}

setInterval(processQueue,20000);
