const socket = io();
let cars={};

// DEMO maşınlar (həmişə görünsün)
function showDemo(){
  const track=document.getElementById("track");
  track.innerHTML='<div id="road"></div><div id="finish"></div>';
  const skins=[
    "ferrari_live_real.png",
    "bmw_live_real.png",
    "lambo_live_real.png",
    "green_live_real.png",
    "purple_live_real.png"
  ];

  for(let i=0;i<5;i++){
    let div=document.createElement("div");
    div.className="car";

    let car=document.createElement("img");
    car.src=skins[i];

    div.appendChild(car);
    track.appendChild(div);
  }
}

showDemo();

socket.on("racePlayers",(players)=>{
  const track=document.getElementById("track");
  track.innerHTML='<div id="road"></div><div id="finish"></div>';
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

    let name=document.createElement("div");
    name.className="username";
    name.innerText="@"+p.user;

    div.appendChild(avatar);
    div.appendChild(car);
    div.appendChild(name);

    track.appendChild(div);
  });
});
