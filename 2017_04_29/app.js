let canvas;
let ctx;
let d = {};
let n = 0;
let rate = 3;
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

setInterval((()=> (epoch.innerHTML = n)), 50)

function draw(argument) {
  requestAnimationFrame(draw);

  let target = (i)=> ((Math.max(Math.min(Math.tan(i), 1), -1) + 1) / 2 )

  if (training) {
    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.graph((i)=> {
      n++;
      if ( n % 1000 === 0) rate = Math.max(.01, rate - .001);

      let x = machine.fwd([i, (Math.max(Math.min(Math.tan(i), 1), -1) + 1) / 2])[0];
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

let relu =  {
  fwd: (x) => ( Math.max(0, x) ),
  back_c: (z) => ( (z <= 0) ? .01 : 0),
  back: (z) => ( (z <= 0) ? .01 : 0)
};

let identity = {
  fwd: (a)=>a,
  back: (a)=>1,
  back_c: (a)=>1
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
    this.b = new Array(this.inputs).fill(null).map(Math.random);
  }

  link(child) {
    if (this.child) {
      this.child.link(child);
    } else {
      this.child = child;
      this.child.parent = this;

      this.child.w = new Array(this.inputs * this.child.inputs).fill(null).map(Math.random)
    }

    return this;
  }

  fwd(input) {
    this.in = input;
    if (this.child) {
      let out = [].concat(this.child.b);

      input.map((value, i)=> {
        for (var j = 0; j < this.child.inputs; j++) {
          out[j] += input[i] * this.child.w[i * this.child.inputs + j];
        }
      });

      return this.child.fwd(out.map(this.activation.fwd));
    } else {
      return input;
    }
  }

  back(error) {
    if (this.parent) {
      let pass = [];

      this.in.map((x, j)=> {

        if (this.child) {
          pass[j] = this.activation.back(x) * (error.map((s, si)=>((s - x) * this.child.w[j * this.child.inputs + si])).reduce((a,b)=>(a+b)))
        } else {
          pass[j] = this.activation.back(x) * (error[j] - x);
        }

        this.b[j] = rate * this.activation.back(x);

        for (var i = 0; i < this.parent.inputs; i++) {
          this.w[i * this.inputs + j] += pass[j] * rate * x;
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
let machine = new Node(2, sigmoid)
  .link(new Node(2, sigmoid))
  .link(last);

let xor = (a, b)=>{
  return Number(!a != !b);
}

let l = new Node(1);
let m = new Node(2, sigmoid).link(new Node(2, sigmoid)).link(l);