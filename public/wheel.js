
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let angle = 0;
let spinning = false;

function drawWheel(){
  ctx.clearRect(0,0,600,600);
  ctx.beginPath();
  ctx.arc(300,300,250,0,Math.PI*2);
  ctx.stroke();
}

function spin(){
  if(spinning) return;
  spinning = true;

  let start = Date.now();
  let duration = 10000;

  function animate(){
    let t = (Date.now()-start)/duration;
    if(t<1){
      angle += (1-t)*0.4;
      drawWheel();
      requestAnimationFrame(animate);
    } else {
      spinning = false;
    }
  }

  animate();
}

drawWheel();
