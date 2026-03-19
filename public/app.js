
const socket = io();

socket.on('players', render);
socket.on('update', render);

socket.on('countdown', ()=>{
    playSound('start.mp3');
});

socket.on('winner', (w)=>{
    playSound('win.mp3');
    document.getElementById('winner').innerHTML =
        "🏆 <b>" + w.user + "</b> qazandı (" + w.reward + ")";
    loadTop();
});

socket.on('like_stream', (u)=>{
    let el = document.getElementById('likes');
    let span = document.createElement('span');
    span.className = "likeItem";
    span.innerText = u;
    el.appendChild(span);
    setTimeout(()=>span.remove(),4000);
});

function render(players){
    let track = document.getElementById('track');
    track.innerHTML='';

    players.forEach((p,i)=>{
        let lane = document.createElement('div');
        lane.className='lane';

        let car = document.createElement('div');
        car.className='car';
        car.style.left = p.progress+'px';

        car.innerHTML = `
            <div class="avatar"></div>
            <div class="name">${p.username}</div>
        `;

        lane.appendChild(car);
        track.appendChild(lane);
    });
}

function loadTop(){
    fetch('/top')
    .then(r=>r.json())
    .then(data=>{
        let lb = document.getElementById('leaderboard');
        lb.innerHTML = "<h3>🏆 TOP 10</h3>";
        data.forEach(d=>{
            lb.innerHTML += d.username + " ("+d.wins+")<br>";
        });
    });
}

function playSound(file){
    let audio = new Audio(file);
    audio.play();
}
