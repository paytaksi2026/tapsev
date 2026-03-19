
const socket = io();
let players = [];

socket.on('players', p=>{
    players = p;
});

function gameLoop(){
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();

function render(){
    const track = document.getElementById('track');
    track.innerHTML = "";

    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className = 'lane';

        // finish line
        let finish = document.createElement('div');
        finish.className = 'finish';
        lane.appendChild(finish);

        // car base (PNG style using emoji fallback)
        let car = document.createElement('div');
        car.className = 'car';
        car.innerText = "🏎️";
        lane.appendChild(car);

        let p = players[i];
        if(p){
            let u = document.createElement('div');
            u.className = 'user';
            u.style.transform = `translateX(${p.progress}px)`;

            u.innerHTML = `
                <img src="${p.avatar}">
                <div class="name">${p.username}</div>
                <div class="nitro">🔥</div>
            `;

            lane.appendChild(u);
        }

        track.appendChild(lane);
    }
}
