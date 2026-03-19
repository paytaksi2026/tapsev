const socket=io();
let cars={};

socket.on("queue",(list)=>{
  const el=document.getElementById("queue");
  el.innerHTML="";
  list.forEach((u,i)=>{
    el.innerHTML+=(i+1)+". "+u.user+"<br>";
  });
});

function demo(){
  const track=document.getElementById("track");
  track.innerHTML='<div id="road"></div><div id="finish"></div>';
  const skins=["ferrari_live_real.png","bmw_live_real.png","lambo_live_real.png","green_live_real.png","purple_live_real.png"];
  for(let i=0;i<5;i++){
    let car=document.createElement("img");
    car.src=skins[i];
    car.style.margin="20px";
    track.appendChild(car);
  }
}
demo();

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML='<div id="road"></div><div id="finish"></div>';
  cars={};

  const skins=["ferrari_live_real.png","bmw_live_real.png","lambo_live_real.png","green_live_real.png","purple_live_real.png"];

  players.forEach((p,i)=>{
    let div=document.createElement("div");
    div.className="car";

    let avatar=document.createElement("img");
    avatar.src=p.avatar;
    avatar.className="avatar";

    let car=document.createElement("img");
    car.src=skins[i];

    let name=document.createElement("div");
    name.className="username";
    name.innerText="@"+p.user;

    let bar=document.createElement("div");
    bar.className="bar";
    bar.style.width="50px";

    div.appendChild(avatar);
    div.appendChild(car);
    div.appendChild(bar);
    div.appendChild(name);

    track.appendChild(div);
    cars[p.user]={bar,div};
  });
});

socket.on("raceStart",()=>{
  let time=180;
  let interval=setInterval(()=>{
    time--;

    for(let u in cars){
      let obj=cars[u];
      let w=parseInt(obj.bar.style.width);
      let boost=Math.random()*25;

      obj.bar.style.width=(w+boost)+"px";

      if(w>900){
        socket.emit("finish",{user:u});
        clearInterval(interval);
      }
    }

    if(time<=0){
      clearInterval(interval);
    }
  },200);
});

socket.on("winner",(data)=>{
  document.getElementById("winner").innerHTML=
  "🏆 "+data.winner.user+" qalib oldu!";
});