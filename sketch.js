let song;
let fft;
let particles = [];
let slider;

function preload() {
  song = loadSound("dab.mp3");
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style("display", "block");
  angleMode(DEGREES);
  fft = new p5.FFT();

  // Create scrubber with custom styling
  slider = createSlider(0, 100, 0);
  slider.position(20, height - 50);
  slider.style("width", "300px");
  slider.class("slider");  // Add the custom class for styling
  slider.input(scrubSong);

  // Set the initial color of the scrubber
  updateScrubberColor();

  // Disable scrolling
  document.body.style.overflow = "hidden";
}

function draw() {
  background(0);
  stroke(255)
  strokeWeight(3)
  noFill()
  translate(width / 2, height / 2);

  fft.analyze();
  let amp = fft.getEnergy(1, 255);
  let ampt = fft.getEnergy(17100);

  let wave = fft.waveform();
  console.log(amp);

  for (let t = -1; t <= 1; t += 2) {
    beginShape();
    for (let i = 0; i <= 180; i += 0.5) {
      let index = floor(map(i, 0, 180, 0, wave.length - 1));

      let r = map(wave[index], -1, 1, 150, 350);

      let x = r * sin(i) * t;
      let y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }

  if (ampt > 0) {
    drawingContext.filter = 'blur(20px)';
    fill(random(0, 204), random(25, 229), 255);
    strokeWeight(5);
    img = circle(0, 0, ampt * 5);
    drawingContext.filter = 'none';
  }

  let p = new Particle();
  particles.push(p);

  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].edges()) {
      particles[i].update(amp);
      particles[i].show();
    } else {
      particles.splice(i, 1);
    }
  }
}

function scrubSong() {
  let val = slider.value();
  let duration = song.duration();
  song.jump(map(val, 0, 100, 0, duration));
  updateScrubberColor();  // Update color while scrubber is moved
}

function updateScrubberColor() {
  let value = slider.value();
  let colorValue = map(value, 0, 100, 0, 255); // Map slider value to color
  let thumbColor = color(255 - colorValue, colorValue, 255 - colorValue);  // Dynamic inverse color
  slider.style('background', `linear-gradient(90deg, ${thumbColor}, #f02c2c)`);
  
  let thumbColorHex = thumbColor.levels.slice(0, 3).map(c => c.toString(16).padStart(2, '0')).join('');
  slider.style('--thumb-color', `#${thumbColorHex}`);
}

function mouseClicked() {
  // Check if the mouse is within the scrubber region
  let sliderX = slider.elt.offsetLeft;
  let sliderWidth = slider.elt.offsetWidth;
  let sliderY = slider.elt.offsetTop;
  let sliderHeight = slider.elt.offsetHeight;

  if (
    mouseX >= sliderX &&
    mouseX <= sliderX + sliderWidth &&
    mouseY >= sliderY &&
    mouseY <= sliderY + sliderHeight
  ) {
    // If the mouse is over the slider, don't toggle play/pause
    return;
  }

  // Otherwise, toggle play/pause behavior
  if (song.isPlaying()) {
    song.pause();
    noLoop();
  } else {
    song.play();
    loop();
  }
}

// Particle class
class Particle {
  constructor() {
    this.loops = 0;
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(.0001, .00001));
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
    if (this.pos.x < -width / 2 || this.pos.x > width / 2 || this.pos.y < -height / 2 || this.pos.y > height / 2) {
      return true;
    } else {
      return false;
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}
