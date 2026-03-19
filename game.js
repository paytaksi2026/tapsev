const socket = io();
let cars={};
let raceTime=180;

function startTimer(){
  const el=document.getElementById("timer");
  let t=180;
  let interval=setInterval(()=>{
    t--;
    el.innerText="Vaxt: "+t+" san";
    if(t<=0) clearInterval(interval);
  },1000);
}

function getCarSkin(){
  const skins=["ferrari.png","bmw.png","lambo.png"];
  return skins[Math.floor(Math.random()*skins.length)];
}

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML='<div id="finish"></div>';
  cars={};

  players.forEach(p=>{
    let div=document.createElement("div");
    div.className="car";

    let car=document.createElement("img");
    car.src=getCarSkin();

    let name=document.createElement("span");
    name.innerText=p.user;

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="50px";

    div.appendChild(car);
    div.appendChild(name);
    div.appendChild(bar);

    track.appendChild(div);
    cars[p.user]=bar;
  });
});

socket.on("raceStart",()=>{
  document.getElementById("engine").play();
  startTimer();

  let interval=setInterval(()=>{
    for(let u in cars){
      let boost=Math.random()*30;

      // turbo effect
      if(Math.random()>0.9){
        boost+=80;
      }

      let w=parseInt(cars[u].style.width);
      cars[u].style.width=(w+boost)+"px";

      if(w>900){
        socket.emit("finish",{user:u});
        document.getElementById("finishSound").play();
        clearInterval(interval);
      }
    }
  },200);
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerText=
  "🏆 "+data.winner.user+" qalib oldu!";
});
