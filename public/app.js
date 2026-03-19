
const socket = io();

let players = [];

socket.on('players', p => { players = p; render(); });
socket.on('update', p => { players = p; render(); });

socket.on('countdown', ()=>{
    startCountdown();
});

function startCountdown(){
    let c = 10;
    const el = document.getElementById('countdown');
    let i = setInterval(()=>{
        el.innerText = "START " + c;
        c--;
        if(c<0){
            clearInterval(i);
            el.innerText="";
        }
    },1000);
}

function render(){
    let track = document.getElementById('track');
    track.innerHTML='';

    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className='lane';

        // finish
        let finish = document.createElement('div');
        finish.className='finish';
        lane.appendChild(finish);

        // crowd
        let crowd = document.createElement('div');
        crowd.className='crowd';
        crowd.innerText = "🧍 🧍‍♀️ 🧍‍♂️ 🧍 🧍‍♂️ 🧍";
        lane.appendChild(crowd);

        // base car ALWAYS visible
        let car = document.createElement('div');
        car.className='car baseCar';
        car.style.left = "0px";
        car.innerText = "🚗";
        lane.appendChild(car);

        let p = players[i];
        if(p){
            let user = document.createElement('div');
            user.className='userInfo';
            user.style.left = p.progress + "px";

            user.innerHTML = `
                <img src="${p.avatar}" class="avatar"/>
                <div class="name">${p.username}</div>
            `;

            lane.appendChild(user);
        }

        track.appendChild(lane);
    }
}
