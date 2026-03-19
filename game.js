const socket = io();
let cars={};

function createSmoke(el){
  let smoke=document.createElement("div");
  smoke.className="smoke";
  el.appendChild(smoke);
  setTimeout(()=>smoke.remove(),800);
}

function createExplosion(el){
  let boom=document.createElement("div");
  boom.className="boom";
  el.appendChild(boom);
  setTimeout(()=>boom.remove(),600);
}

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML='<div id="finish"></div>';
  cars={};

  players.forEach(p=>{
    let div=document.createElement("div");
    div.className="car";

    let avatar=document.createElement("img");
    avatar.src=p.avatar;
    avatar.className="avatar";

    let car=document.createElement("img");
    car.src=["ferrari_small.png","bmw_small.png","lambo_small.png"][Math.floor(Math.random()*3)];

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
      let boost=Math.random()*25;

      if(Math.random()>0.9){
        boost+=70;
        createExplosion(obj.div);
      }

      if(Math.random()>0.7){
        createSmoke(obj.div);
      }

      obj.bar.style.width=(w+boost)+"px";

      if(w>900){
        socket.emit("finish",{user:u});
        clearInterval(interval);
      }
    }
  },200);
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerText=
  "🏆 "+data.winner.user+" qalib oldu!";
});
