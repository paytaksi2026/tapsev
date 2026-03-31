let queue=[];
let winners={};
let likes={};
let gifts={};

function updateList(id,data){
 let el=document.getElementById(id);
 el.innerHTML="";
 Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([u,v])=>{
  let li=document.createElement("li");
  li.innerText=u+" ("+v+")";
  el.appendChild(li);
 });
}

function roll(user){
 let d1=Math.floor(Math.random()*6)+1;
 let d2=Math.floor(Math.random()*6)+1;
 document.getElementById("dice1").innerText=d1;
 document.getElementById("dice2").innerText=d2;

 if(d1==6 && d2==6){
   winners[user]=(winners[user]||0)+1;
   document.getElementById("result").innerText="ŞEŞ QOŞA!";
   updateList("winners",winners);
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

// simulate TikTok
setInterval(()=>{
 let u="user"+Math.floor(Math.random()*5);

 likes[u]=(likes[u]||0)+500;
 gifts[u]=(gifts[u]||0)+50;

 if(likes[u]>=1000){
  queue.push(u);
  likes[u]=0;
 }
 if(gifts[u]>=100){
  queue.push(u);
  gifts[u]=0;
 }

 updateList("topLikes",likes);
 updateList("topGifts",gifts);

},3000);
