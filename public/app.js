
const socket = io();

let lastPlayers = [];

socket.on('players', p => { lastPlayers = p; render(p); });
socket.on('update', p => { lastPlayers = p; render(p); });

function render(players){
    let track = document.getElementById('track');
    track.innerHTML='';

    // ALWAYS show 5 lanes even if empty
    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className='lane';

        let p = players[i];

        if(p){
            let car = document.createElement('div');
            car.className='car';
            car.style.left = p.progress+'px';

            car.innerHTML = `
                <div class="avatar"></div>
                <div class="name">${p.username}</div>
            `;

            lane.appendChild(car);
        }

        track.appendChild(lane);
    }
}
