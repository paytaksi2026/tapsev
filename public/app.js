
const socket = io();

socket.on('players', render);
socket.on('update', render);

socket.on('countdown', ()=>{
    document.getElementById('startSound').play();
});

socket.on('winner', (w)=>{
    document.getElementById('winSound').play();
    document.getElementById('winner').innerText =
        "🏆 " + w.user + " qazandı (" + w.reward + ")";
    loadTop();
});

socket.on('like_stream', (u)=>{
    let el = document.getElementById('likes');
    let span = document.createElement('span');
    span.innerText = u + " ";
    el.appendChild(span);
    setTimeout(()=>span.remove(),3000);
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
        car.innerHTML = "🚗<br>"+p.username;

        lane.appendChild(car);
        track.appendChild(lane);
    });
}

function loadTop(){
    fetch('/top')
    .then(r=>r.json())
    .then(data=>{
        let lb = document.getElementById('leaderboard');
        lb.innerHTML = "<h3>TOP 10</h3>";
        data.forEach(d=>{
            lb.innerHTML += d.username + " ("+d.wins+")<br>";
        });
    });
}
