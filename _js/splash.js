var particles = [];
var deadparticles = [];
var lastRelease = 0;
var releaseRate = 100;
var minLife = 3000;
var maxLife = 6000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
}

function draw(){
  background(0);
  if(millis() - lastRelease > releaseRate){
    //var c = getColor((millis() * 0.01) % 255);
    var c = color(255);
    particles.push(new Particle(random(windowWidth), random(windowHeight), c));
    lastRelease = millis();
  }
  // if(mouseIsPressed){
  //   blendMode(SCREEN);
  // } else {
  //   blendMode(NORMAL);
  // }
  for(var i=0; i<particles.length; i++){
    particles[i].move();
    particles[i].draw();
    if(particles[i].dead){
      deadparticles.push(particles[i]);
    }
  }
  // remove the dead wiggles from render list
  for(var n=0; n<deadparticles.length; n++){
    var index = particles.indexOf(deadparticles[n]);
    if(index > -1){
      particles.splice(index, 1);
    }
  }
  deadparticles = [];
}

function getColor(pos){
  // returns a value from the rainbow spectrum
  var w = color(255);
  var b = color(0,0,255);
  var g = color(0,255,0);
  var y = color(255,255,0);
  var r = color(255,0,0);
  if(pos >= 0 && pos < 0.25){
    return lerpColor(w, b, pos);
  } else if(pos >= 0.25 && pos < 0.5){
    return lerpColor(b, g, pos);
  } else if(pos >= 0.5 && pos < 0.75){
    return lerpColor(g, y, pos);
  } else {
    return lerpColor(y, r, pos);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Particle(x, y, c){
  this.x = x;
  this.y = y;
  this.c = c;
  this.pastx = [x];
  this.pasty = [y];
  this.xv = 0;
  this.yv = 0;
  this.perpxv = 0;
  this.perpyv = 0;
  this.maxalpha = 255;
  this.alpha = this.maxalpha;
  this.damping = 0.97;
  this.taillength = 10;
  this.alphastep = 255 / this.taillength;
  this.birth = millis();
  this.lifespan = random(minLife,maxLife);
  this.fading = false;
  this.fadeStart = 0;
  this.fadeDuration = 2000;
  this.d = 3;
}

Particle.prototype = {
  constructor:Particle,

  draw:function(){
    var vertices = [];
    for(var i=0; i<this.pastx.length-1; i++){
      //stroke(red(this.c), green(this.c), blue(this.c), ((this.alphastep*i)/255)*this.alpha);
      //line(this.pastx[i], this.pasty[i], this.pastx[i+1], this.pasty[i+1]);
      this.drawPoly(createVector(this.pastx[i], this.pasty[i]), createVector(this.pastx[i+1], this.pasty[i+1]), i);
    }
  },

  drawPoly:function(pointA, pointB, index){
    var grad = drawingContext.createLinearGradient(pointA.x, pointA.y, pointB.x, pointB.y);
    var colorA = color(red(this.c), green(this.c), blue(this.c), ((this.alphastep * index)/255)*this.alpha);
    var colorB = color(red(this.c), green(this.c), blue(this.c), ((this.alphastep * (index+1))/255)*this.alpha);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    drawingContext.fillStyle = grad;

    var xdiff = pointA.x - pointB.x;
    var ydiff = pointA.y - pointB.y;
    var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    var linehalf = this.d * (index / this.pastx.length);
    var xvec = ydiff/dist;
    var yvec = 0 - xdiff/dist;
    var xdist = xvec * linehalf;
    var ydist = yvec * linehalf;

    drawingContext.beginPath();
    drawingContext.moveTo(pointA.x + xdist, pointA.y + ydist);
    drawingContext.lineTo(pointA.x - xdist, pointA.y - ydist);

    linehalf = this.d * ((index+1) / this.pastx.length);
    xdist = xvec * linehalf;
    ydist = yvec * linehalf;

    drawingContext.lineTo(pointB.x - xdist, pointB.y - ydist);
    drawingContext.lineTo(pointB.x + xdist, pointB.y + ydist);
    drawingContext.closePath();
    drawingContext.fill();
  },

  move:function(){
    if(millis() - this.birth > this.lifespan){
      if(!this.fading){
          this.fading = true;
          this.fadeStart = millis();
      } else {
        var p = (millis() - this.fadeStart) / this.fadeDuration;
        if(p >= 1){
          this.alpha = 0;
          this.dead = true;
        } else {
          this.alpha = this.maxalpha - (p * this.maxalpha);
        }
      }
    }
    this.pastx.push(this.x);
    this.pasty.push(this.y);
    if(this.pastx.length > this.taillength){
      this.pastx.shift();
      this.pasty.shift();
    }

    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;

    if(mouseIsPressed){   // move away
      this.xv -= xdiff * 0.001;
      this.yv -= ydiff * 0.001;
    } else {              // move towards
      this.xv += xdiff * 0.001;
      this.yv += ydiff * 0.001;
    }
    // noise
    this.xv += random(-1,1);
    this.yv += random(-1,1);
    // measure speed
    var speed = sqrt(this.xv*this.xv + this.yv*this.yv);
    this.c = getColor(speed * 0.05);
    // get perpindicular vector

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
