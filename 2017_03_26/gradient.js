let canvas;
let ctx;
let color;
let s, c;

window.onload = ()=> {
  canvas = document.querySelector('canvas');
  ctx = (canvas.getContext('2d'));
  draw();
}

function draw(argument) {
  requestAnimationFrame(draw);
  // ctx.clearRect(0,0,500,500);

  for (var i = 0; i < 500; i++) {
    s = Math.floor(Math.sin(i / 20) * 128) + 128;
    c =  Math.floor(Math.cos(i / 20) * 128) + 128;
    color = `rgb(0, ${c}, ${s})`;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 500);
    ctx.stroke();
  }

  // console.log('hey');
}