const socket = io();
let cars={};
let raceTime=180;
let timerInterval=null;

function startTimer(){
  raceTime=180;
  const el=document.getElementById("timer");
  timerInterval=setInterval(()=>{
    raceTime--;
    el.innerText="Vaxt: "+raceTime+" san";
    if(raceTime<=0){
      clearInterval(timerInterval);
    }
  },1000);
}

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML="";
  cars={};

  players.forEach(p=>{
    let div=document.createElement("div");
    div.className="car";

    let car=document.createElement("img");
    car.src="car.png";

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
      let w=parseInt(cars[u].style.width);
      cars[u].style.width=(w+Math.random()*20)+"px";
      if(w>1000){
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
