const socket = io();
let cars={};

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML="";
  cars={};

  players.forEach(p=>{
    let div=document.createElement("div");
    div.className="car";

    let img=document.createElement("img");
    img.src=p.avatar;

    let name=document.createElement("span");
    name.innerText=p.user;

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="50px";

    div.appendChild(img);
    div.appendChild(name);
    div.appendChild(bar);

    track.appendChild(div);
    cars[p.user]=bar;
  });

  document.getElementById("engine").play();
});

socket.on("raceStart",()=>{
  let interval=setInterval(()=>{
    for(let u in cars){
      let w=parseInt(cars[u].style.width);
      cars[u].style.width=(w+Math.random()*40)+"px";
      if(w>900){
        socket.emit("finish",{user:u});
        document.getElementById("finishSound").play();
        clearInterval(interval);
      }
    }
  },300);
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerText=
  "🏆 "+data.winner.user+" qalib oldu!";

  let html="<h3>Ən yaxşı 15</h3>";
  let sorted=Object.entries(data.leaderboard)
  .sort((a,b)=>b[1]-a[1]).slice(0,15);

  sorted.forEach((u,i)=>{
    html+=(i+1)+". "+u[0]+" ("+u[1]+")<br>";
  });

  document.getElementById("leaderboard").innerHTML=html;
});
