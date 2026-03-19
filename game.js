const socket=io();
let cars={};

socket.on("queue",(list)=>{
  let q=document.getElementById("queue");
  q.innerHTML="";
  list.forEach((u,i)=>{q.innerHTML+=(i+1)+". "+u.user+"<br>";});
});

socket.on("racePlayers",(players)=>{
  let track=document.getElementById("track");
  track.innerHTML="";
  cars={};

  players.forEach(p=>{
    let div=document.createElement("div");
    div.className="car";

    let name=document.createElement("div");
    name.innerText="🚗 "+p.user;

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="0px";

    div.appendChild(name);
    div.appendChild(bar);

    track.appendChild(div);
    cars[p.user]=bar;
  });
});

socket.on("updateProgress",(data)=>{
  for(let u in data){
    if(cars[u]){
      cars[u].style.width=data[u].score+"px";
    }
  }
});

socket.on("winner",(d)=>{
  document.getElementById("winner").innerText="🏆 "+d.winner.user+" qalib!";
});
