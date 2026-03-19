const socket = io();
let cars={};

socket.on("queue",(list)=>{
  const el=document.getElementById("queue");
  el.innerHTML="";
  list.forEach((u,i)=>{
    el.innerHTML += (i+1)+". "+u.user+"<br>";
  });

  if(list.length===3){
    document.getElementById("alert").style.display="block";
    document.getElementById("alertSound").play();
  }
});

socket.on("racePlayers",(players)=>{
  document.getElementById("alert").style.display="none";

  const track=document.getElementById("track");
  track.innerHTML='<div id="finish"></div>';
  cars={};

  const skins=[
    "ferrari_live_real.png",
    "bmw_live_real.png",
    "lambo_live_real.png",
    "green_live_real.png",
    "purple_live_real.png"
  ];

  players.forEach((p,i)=>{
    let div=document.createElement("div");
    div.className="car";

    let avatar=document.createElement("img");
    avatar.src=p.avatar;
    avatar.className="avatar";

    let car=document.createElement("img");
    car.src=skins[i];

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="50px";

    div.appendChild(avatar);
    div.appendChild(car);
    div.appendChild(bar);

    track.appendChild(div);
    cars[p.user]={bar,div};
  });
});

socket.on("raceStart",()=>{
  let interval=setInterval(()=>{
    for(let u in cars){
      let obj=cars[u];
      let w=parseInt(obj.bar.style.width);
      let boost=Math.random()*30;

      obj.bar.style.width=(w+boost)+"px";

      if(w>900){
        socket.emit("finish",{user:u});
        document.getElementById("finishSound").play();
        document.getElementById("track").classList.add("zoom");
        clearInterval(interval);
      }
    }
  },200);
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerText=
  "🏆 "+data.winner.user+" qalib oldu!";
});
