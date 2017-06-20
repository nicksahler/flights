let canvas;
let ctx;
let color;

var particles = [];
const X = 0, Y = 1;

class Vector {
  constructor(v) {
    // Allow size
    this.value = v;
  }

  addTo(other) {
    // Throw if not same size
    for (var i in this.value) {
      this.value[i] += other.get(i);
    }
    
    return this;
  }

  times(scalar) {
    // Throw if not same size
    for (var i in this.value) {
      this.value[i] *= scalar;
    }

    return this;
  }

  get(i) {
    return this.value[i];
  }

  set(i, v) {
    this.value[i] = v;
  }

  X() {
    return this.get(0);
  }

  Y() {
    return this.get(1);
  }

  Z() {
    return this.get(2);
  }
}

class Particle {
  constructor() {
    this.v = new Vector([Math.random() * 5 - 2.5, -10]);
    this.a = new Vector([0, 0]);
    this.c = new Vector([0, 255, 0]);
    this.p = new Vector([1024 / 2, 1024 / 4]);
    this.kill_time = Date.now() + 5000;
    this.s = new Vector([10, 10]);
  }

  update() {
    this.v.addTo(this.a);
    this.v.addTo(new Vector([0, 9.8 / 60]));

    this.p.addTo(this.v);

    if (Date.now() > this.kill_time) return true;
  }

  draw(ctx) {
    ctx.fillStyle = `rgb(${this.c.value.join(',')})`;
    ctx.beginPath();
    ctx.fillRect(this.p.X() - (this.s.X() / 6), this.p.Y() - (this.s.Y() / 2), this.s.X() / 3, this.s.Y());

    ctx.fillRect(this.p.X() - (this.s.X() / 2), this.p.Y() - (this.s.Y() / 6), this.s.X(), this.s.Y() / 3);
  }
}

class Floater extends Particle {
  constructor() {
    super();
  }

  update() {
    this.a.set(X, Math.cos( ( this.p.X()  / 50 ) ));
    this.c = new Vector([0, 0, (Math.floor(Math.sin(this.p.X() / 256) * 128) + 128)]);
    super.update();

  }
}

setInterval(()=>{
  particles = particles.filter((p)=> {
    return !p.update();
  });
}, 100 / 6);

setInterval(() => {
  let n = new ((Math.random() > 0.5) ? Floater : Particle ) ();
  particles.push(n);
  // console.log(particles.length);
}, 100)

window.onload = ()=> {
  canvas = document.querySelector('canvas');
  ctx = (canvas.getContext('2d'));

  for (var i = 0; i < 5; i++)
    particles.push(new Particle());

  draw();
}

function draw(argument) {
  requestAnimationFrame(draw);
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, 1024, 1024);
  let t;
  for (var i in particles) {
    particles[i].draw(ctx);
  }
}