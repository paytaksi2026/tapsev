
const socket = io();
let players = [];
let hearts = [];

socket.on('players', p=>{
    players = p;
});

socket.on('likeEffect', user=>{
    hearts.push({x:Math.random()*window.innerWidth, y:window.innerHeight});
});

socket.on('nitro', user=>{
    // trigger stronger animation (handled in render)
});

function loop(){
    render();
    requestAnimationFrame(loop);
}
loop();

function render(){
    const track = document.getElementById('track');
    track.innerHTML = "";

    // hearts animation
    hearts.forEach(h=>{
        h.y -= 2;
    });
    hearts = hearts.filter(h=>h.y>0);

    hearts.forEach(h=>{
        let el = document.createElement('div');
        el.className="heart";
        el.style.left = h.x+"px";
        el.style.top = h.y+"px";
        el.innerText="❤️";
        document.body.appendChild(el);
        setTimeout(()=>el.remove(),500);
    });

    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className='lane';

        let finish = document.createElement('div');
        finish.className='finish';
        lane.appendChild(finish);

        let car = document.createElement('div');
        car.className='car';
        car.innerText='🏎️';
        lane.appendChild(car);

        let p = players[i];
        if(p){
            let u = document.createElement('div');
            u.className='user';
            u.style.transform=`translateX(${p.progress}px)`;

            u.innerHTML=`
                <img src="${p.avatar}">
                <div class="name">${p.username}</div>
                <div class="trail">🔥🔥</div>
            `;

            lane.appendChild(u);
        }

        track.appendChild(lane);
    }
}
