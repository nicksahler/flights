let canvas;
let ctx;
let d = {};
let n = 0;
let rate = .01;
let training = false;
let epoch;

window.onload = ()=> {
  canvas = document.querySelector('canvas');
  ctx = (canvas.getContext('2d'));
  epoch = document.querySelector('#epoch');

  draw();

  window.onkeydown = function(e) {
    if (e.code === "Space") training = !training;
  }
}

setInterval((()=> (epoch.innerHTML = n)), 16)

function draw(argument) {
  requestAnimationFrame(draw);

  let target = (i)=> (Math.max(Math.min(Math.tan(i), 1), 0))

  if (training) {
    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.graph((i)=> {
      n++;
      // if ( n % 10000 === 0) rate -= .1;

      // console.log(rate);
      let x = machine.fwd([i])[0];
      last.back([target(i)]);
      return x;
    }, 0, 0, { from: 0.001, to: Math.PI * 4, granularity: .01, scale: 0.5});

    ctx.stroke();
  }

  ctx.strokeStyle = '#F00';
  ctx.graph(target, 0, 0, { from: 0.001, to: Math.PI * 4, granularity: .01, scale: 0.5});
}


CanvasRenderingContext2D.prototype.graph = function(f, x, y, args) {
  ctx.beginPath();
  let sY = scale(-4, 4, 0, 512);
  let sX = scale(args.from, args.to, 0, 1024);

  for (var i = args.from; i < args.to; i+= args.granularity) {
    let val = f(i);
    ctx.lineTo(sX * i, 256 - (sY * val));
  }

  ctx.stroke();
}

/* Utilities */
let scale = (a, b, x, y) => ((y - x) / (b - a));

let sigmoid =  {
  fwd: (x) => ( 1 / (1 + Math.exp(-x))),
  back_c: (z) => (sigmoid.fwd(z) * (1 - sigmoid.fwd(z))),
  back: (c) => ( c * (1 - c))
};

let identity = {
  fwd: (a)=>a,
  back: (a)=>1
}

let softmax = (data) => {
  let total = data.map(Math.exp).reduce((a, b)=> a + b );
  return (i)=> (Math.exp(data[i]) / total);
}

let softmax_all = (data) => {
  let sm = softmax(data);
  return data.map((x,i)=>sm(i));
}

class Node {
  constructor(inputs, activation) {
    this.inputs = inputs;
    this.activation = activation || identity;
  }

  link(child) {
    if (this.child) {
      this.child.link(child);
    } else {
      this.child = child;
      this.child.parent = this;

      this.b = new Array(this.child.inputs).fill(null).map(Math.random);
      this.w = new Array(this.inputs * this.child.inputs).fill(null).map(Math.random);
    }

    return this;
  }

  fwd(input) {
    this.in = input;
    if (this.child) {
      let out = [].concat(this.b);

      input.map((value, i)=> {
        for (var j = 0; j < this.child.inputs; j++) {
          out[j] += value * this.w[i * this.child.inputs + j];
        }
      });

      this.out = out.map(this.activation.fwd);
      return this.child.fwd(this.out);
    } else {
      this.out = input;
      return this.out;
    }
  }

  back(error) {
    if (this.parent) {
      let pass = [];
      let p = this.parent;
      this.out.map((x, j)=> {
        pass[j] = this.activation.back(x) * (error[j] - x);

        // pass[j] = this.activation.back(x) * (error.map((s, si)=>(s * this.w[j * error.length + si])).reduce((a,b)=>(a+b)))

        if (this.child) {
          this.b[j] = rate * this.activation.back(x);

          for (var i = 0; i < this.out.length; i++) {
            // console.log(i, error.length,  j);
            this.w[i * error.length + j] += pass[j] * rate;
          }
        }
      });

      this.parent.back(pass);
    } else {
      // console.log('Input Layer', this.in);
    }
  }
}

/* Testing */
let last = new Node(1);
let machine = new Node(1, sigmoid)
  .link(new Node(2, sigmoid))
  .link(new Node(2, sigmoid))
  .link(last);

let xor = (a, b)=>{
  return Number(!a != !b);
}

let l = new Node(1);
let m = new Node(2, sigmoid).link(new Node(2, sigmoid)).link(new Node(1, sigmoid)).link(l);