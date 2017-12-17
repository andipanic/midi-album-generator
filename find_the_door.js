var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = document.documentElement.scrollHeight;


// Handle key input
var KeyHandler = {
  init: function() {
    window.addEventListener('keydown', event =>
      KeyHandler.keyDown(event), false);
    window.addEventListener('keyup', event =>
      KeyHandler.keyUp(event), false);
  },
  pressed: [],
  keyDown: function(e) {
    this.pressed[e.keyCode] = true;
  },
  keyUp: function(e) {
    this.pressed[e.keyCode] = false;
  },
}

KeyHandler.init();

// Objects
var Player = {
  x: 100,
  y: 100,
  vx: 4,
  vy: 4,
  color: 'red',
  size: 8,
  update: function() {

    // Left
    if (KeyHandler.pressed[65]) {
      this.x -= this.vx;
    }
    // Up
    if (KeyHandler.pressed[87]) {
      this.y -= this.vy;
    }
    // Right
    if (KeyHandler.pressed[68]) {
      this.x += this.vx;
    }
    // Down
    if (KeyHandler.pressed[83]) {
      this.y += this.vy;
    }
    this.draw();
  },
  draw: function() {
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.size, this.size);
  }
}


function r(n) {
	if(n) {
  	return parseInt(Math.random() * n);
  }else{
  	return parseInt(Math.random() * 255);
  }
}

var Particle = function(x, y, size) {
  this.x = x;
  this.y = y;
  this.dy = Math.random();
  this.dx = Math.random() - .5;
  this.gravity = .9;
  this.size = size;
  this.alpha = 1;
  this.color = r() + ", " + r() + ", " + r();
  this.draw = function() {
    c.fillStyle = "rgba(" + this.color + "," + this.alpha + ")";
    c.fillRect(this.x, this.y, this.size, this.size);
  }
  this.update = function() {
    this.dy /= this.gravity;
    this.y += this.dy;
    this.x += this.dx;
    this.alpha -= .03;
    this.draw();
  }
}

var Tile = function(x = null, y = null, size = null) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.explode = false;
  this.particles = [];
  this.hidden = false;
  this.finished = false;
  this.isDoor = false;
  this.color = r() + ", " + r() + ", " + r();
  this.draw = function() {
    if (!this.hidden) {
      c.fillStyle = 'rgba(' + this.color + ', 1)';
      c.fillRect(this.x, this.y, this.size, this.size);
    }

  }
  this.drawParticles = function() {
    if (this.particles.length == 0) {
      this.finished = true;
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
      if (this.particles[i].alpha < .1) {
        this.particles.splice(i, 1);
      }
    }
  }
  this.update = function() {
    if (this.explode && !this.hidden) {
      for (var i = this.x; i < this.x + this.size; i += this.size/16) {
        for (var j = this.y; j < this.y + this.size; j += this.size/16) {
          this.particles.push(new Particle(i, j, this.size/16));
        }
      }
      this.hidden = true;
      this.explode = false;
    }
    if (this.hidden) {
      this.drawParticles();
    }else {
      this.draw();
    }
  }
}

function intersectRect(r1, r2) {
  return !(r2.x > r1.x + r1.size ||
    r2.x + r2.size < r1.x ||
    r2.y > r1.y + r1.size ||
    r2.y + r2.size < r1.y);
}



var generate_map = function (x) {
var grid = [];
var div = parseInt(Math.min(canvas.width, canvas.height) / x);
for (var i = 0; i < canvas.width; i += div) {
  for (var j = 0; j < canvas.height - (canvas.height % x); j += div) {
    grid.push(new Tile(i, j, div));
  }
}
grid[r(grid.length)].isDoor = true;
return grid;
}

var exploded = [];
var level = 1;
var blocks = generate_map(level);
var found = false;
function loop() {
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);
  Player.update();
  for (var i = 0; i < blocks.length; i++) {
    if (intersectRect(Player, blocks[i])) {
    	if (blocks[i].isDoor){
        found = true;
        level *= 2;
      }else{
      	blocks[i].explode = true;
        //var removed = blocks.splice(i, 1)[0]
        var removed = blocks[i]
        if (!exploded.indexOf(removed)) {
          exploded.push(removed);
          console.log(exploded.indexOf(removed));
        }
      }
    }

    if (found) {
      blocks = generate_map(level);
      found = false;
    }

    blocks[i].update();
  }
  for (var i = 0; i < exploded.length; i++) {
    if (!exploded[i].finished) {
      exploded[i].update();
    }
  }


  requestAnimationFrame(loop);
}
loop();
