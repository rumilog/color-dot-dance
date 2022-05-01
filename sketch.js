var song;
var fft;
var particles =  [];

function preload(){
  song = loadSound("dab.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES)
  fft = new p5.FFT()
  d = 5;
}

function draw() {
  background(0);
  stroke(255)
  strokeWeight(3)
  noFill()
  translate(width/2, height/2);

  fft.analyze()
  amp = fft.getEnergy(1,255)
  ampt= fft.getEnergy(17100)

  var wave = fft.waveform();
  console.log(amp);
  for(var t= -1; t<=1; t+=2){
    beginShape()
    for(var i=0;i<=180;i+=.5){
      var index = floor(map(i, 0, 180, 0, wave.length-1))
  
      var r = map(wave[index], -1,1,150,350);
  
      var x = r*sin(i) * t;
      var y = r*cos(i);
      vertex(x,y);
    }
    endShape()
  }
  if(ampt>0){
    drawingContext.filter = 'blur(20px)';
    fill(random(0,204), random(25,229), 255);
    strokeWeight(5)
    img = circle(0,0,ampt*5)
    drawingContext.filter = 'none';
  }
  

  var p = new Particle();
  particles.push(p)
  
  for(var i=particles.length-1; i>=0;i--){
    if (!particles[i].edges()){
      particles[i].update(amp);
      particles[i].show();
    }
    else{
      particles.splice(i,1);
    }
  }


}

function mouseClicked(){
  if (song.isPlaying()){
    song.pause();
    noLoop();
  }
  else{
    song.play();
    loop();
  }
}



class Particle{
  constructor(){
    this.loops = 0;
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0,0);
    this.acc = this.pos.copy().mult(random(.0001, .00001))
    this.n = 1;
    this.w = 2;
    this.color = [random(0,255), random(0,255), random(0,255)]
  }
  update(amp){
    //this.w = Math.sqrt((this.pos.x - width/2)*(this.pos.x - width/2) + (this.pos.y - height/2)*(this.pos.y - height/2))/20
    this.w += this.loops * 0.08
    this.loops += 0.01
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    if(amp>230&&amp<250){
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
    }
    else if(amp>=250){
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)

    }
  }


  edges(){
    if(this.pos.x< -width/2 || this.pos.x > width/2 || 
      this.pos.y< -height/2 || this.pos.y>height/2){
        return true;
      }
      else{ 
        return false;
      }
      }
  show(){
    noStroke()
    fill(this.color)
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}
