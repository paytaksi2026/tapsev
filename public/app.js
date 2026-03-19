
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
    el.innerText = "START " + c;
    let i = setInterval(()=>{
        c--;
        el.innerText = "START " + c;
        if(c<=0){
            clearInterval(i);
            el.innerText = "";
        }
    },1000);
}

function render(){
    let track = document.getElementById('track');
    track.innerHTML='';

    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className='lane';

        // spectators
        let crowd = document.createElement('div');
        crowd.className='crowd';
        crowd.innerText = "🧍 🧍‍♀️ 🧍‍♂️ 🧍 🧍‍♂️";
        lane.appendChild(crowd);

        let p = players[i];
        if(p){
            let car = document.createElement('div');
            car.className='car';
            car.style.left = p.progress+'px';

            car.innerHTML = `
                🔥🚗
                <div class="name">${p.username}</div>
            `;

            lane.appendChild(car);
        }

        track.appendChild(lane);
    }
}
