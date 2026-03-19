const socket=io();
let cars={};

socket.on("queue",(list)=>{
  const el=document.getElementById("queue");
  el.innerHTML="";
  list.forEach((u,i)=>{
    el.innerHTML+=(i+1)+". "+u.user+"<br>";
  });
});

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML='<div id="road"></div><div id="finish"></div>';
  cars={};

  players.forEach((p,i)=>{
    let div=document.createElement("div");
    div.className="car";

    let avatar=document.createElement("img");
    avatar.src=p.avatar;
    avatar.className="avatar";

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="0px";

    let name=document.createElement("div");
    name.className="username";
    name.innerText="@"+p.user;

    div.appendChild(avatar);
    div.appendChild(bar);
    div.appendChild(name);

    track.appendChild(div);
    cars[p.user]={bar};
  });
});

socket.on("updateProgress",(data)=>{
  for(let u in data){
    if(cars[u]){
      cars[u].bar.style.width = data[u].score + "px";
    }
  }
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerHTML=
  "🏆 "+data.winner.user+" qalib oldu! 💰 "+data.reward.toFixed(2);
});
