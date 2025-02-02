var song;
var fft;
var particles = [];
var slider; // Scrubber slider

function preload() {
  song = loadSound("dab.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  fft = new p5.FFT();
  
  // Create the slider for scrubbing
  slider = createSlider(0, 100, 0); // Values will be updated dynamically
  slider.position(20, height - 50);
  slider.style("width", "300px");
  slider.input(scrubSong); // Call function when slider is moved
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(3);
  noFill();
  translate(width / 2, height / 2);

  fft.analyze();
  let amp = fft.getEnergy(1, 255);
  let ampt = fft.getEnergy(17100);

  var wave = fft.waveform();

  for (var t = -1; t <= 1; t += 2) {
    beginShape();
    for (var i = 0; i <= 180; i += 0.5) {
      var index = floor(map(i, 0, 180, 0, wave.length - 1));
      var r = map(wave[index], -1, 1, 150, 350);
      var x = r * sin(i) * t;
      var y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }

  if (ampt > 0) {
    drawingContext.filter = "blur(20px)";
    fill(random(0, 204), random(25, 229), 255);
    strokeWeight(5);
    circle(0, 0, ampt * 5);
    drawingContext.filter = "none";
  }

  var p = new Particle();
  particles.push(p);

  for (var i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].edges()) {
      particles[i].update(amp);
      particles[i].show();
    } else {
      particles.splice(i, 1);
    }
  }

  // Update slider position dynamically
  if (song.isPlaying()) {
    slider.value(map(song.currentTime(), 0, song.duration(), 0, 100));
  }
}

function mouseClicked() {
  userStartAudio(); // Ensures autoplay works
  if (song.isPlaying()) {
    song.pause();
    noLoop();
  } else {
    song.play();
    loop();
  }
}

// Function to scrub through the song
function scrubSong() {
  let newTime = map(slider.value(), 0, 100, 0, song.duration());
  song.jump(newTime);
}

// Particle class remains unchanged
class Particle {
  constructor() {
    this.loops = 0;
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.n = 1;
    this.w = 2;
    this.color = [random(0, 255), random(0, 255), random(0, 255)];
  }

  update(amp) {
    this.w += this.loops * 0.08;
    this.loops += 0.01;
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (amp > 230 && amp < 250) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    } else if (amp >= 250) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    return (
      this.pos.x < -width / 2 ||
      this.pos.x > width / 2 ||
      this.pos.y < -height / 2 ||
      this.pos.y > height / 2
    );
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}
