/**
 * #WCCChallenge Topic: "Drive" Created by RaphaĆ«l de Courville (https://openprocessing.org/curation/78544)
 * 
 * inspred by :
 * - [Swirls by Simon](https://openprocessing.org/sketch/1965018) : function  drawSwirls() ; CC-BY-NC-SA
 * - [The Piano Recital by Corey Huang](https://openprocessing.org/sketch/1174589): piano part ; CC-BY-SA
 * 
 * Interaction system by libregd + Copilot
 */

let keys = [];
let decorations = [];
let oscillators = {};
let img; // image object
let t = 0;
let angle = 0;
function preload() {
  img = loadImage('https://media.tenor.com/JPOhHuokpdYAAAAi/pop-cat.gif'); // img url
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  noStroke();
  textSize(14);
colorMode(HSB, 360, 100, 100, 100); // set color mode is HSB
  

//------pianoKeysShow  start ------//
let layout = {
    startX: (windowWidth-1000)/2,
    startY: (windowHeight-200),
    whiteKeyWidth: 100,
    whiteKeyHeight: 150,
    blackKeyWidth: 50,
    blackKeyHeight: 40,
    rowSpacing: 10
  };
// only one row keys
  let rows = [
{ letters: ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4'],
  btns: ['1','2','3','4','5','6','7','8','9','0'],
  freqs: [130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63]}  ];

  let skipBlack = [2, 6];

  for (let r = 0; r < rows.length; r++) {
    for (let i = 0; i < rows[r].letters.length; i++) {
      let x = layout.startX + i * layout.whiteKeyWidth;
      let y = layout.startY + r * (layout.whiteKeyHeight + layout.rowSpacing);
      keys.push(new PianoKey(x, y, layout.whiteKeyWidth, layout.whiteKeyHeight, rows[r].letters[i], rows[r].btns[i], rows[r].freqs[i]));
      //the balck key only draw, no pressed func 
      if (i < rows[r].letters.length - 1 && !skipBlack.includes(i)) {
        let bx = x + layout.whiteKeyWidth * 0.7;
        let by = y;
        decorations.push({x: bx, y: by});
      }
    }
  }

  userStartAudio(); // actived audio 
}
// ****** draw()  start ******//
function draw() {
  background(0,0,0, 10); // 10% alpha all black
  // about backgound swirls
  push();
  t++;
  translate(width / 2, height / 2);
  drawSwirls(t, angle);
  angle += 0.001; // contrl the rotate speed , lower become slower
  pop();

  drawWhiteKeys();        // white keys are important
  drawBlackDecorations(); // black keys only for decoration
  drawBars();             // bars for pressed
  drawImages();           // img for pressed
  
}

// ****** images  start ******//
function drawImages() {
  keys.forEach(k => {
    if (k.pressed) {
      image(img, k.x + k.w/2 - 30, k.y - 60, 60, 60); // display gif image on the top of keyboard.
    }
  });
}

// ****** white keys  start ******//
function drawWhiteKeys() {
  keys.forEach(k => k.display());
}
// ****** black keys  start ******//
function drawBlackDecorations() {
  fill(360,0,0,100);
  decorations.forEach(d => {
    rect(d.x, d.y, 60, 80,0,0,4,4); // 0,0,4,4 give a border radius
  });
}
// ******  piano keys class  start ******//
class PianoKey {
  constructor(x, y, w, h, letter,btn, freq) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.letter = letter;
    this.btn = btn;
    this.freq = freq;
    this.pressed = false; // !important
    
  }

  display() {
    fill(this.pressed ? (0,0,100) : (0,0,90)); // if pressed, white keys became lighter
    stroke(0);
    rect(this.x, this.y, this.w, this.h,0,0,4,4);
    fill(0);
    noStroke();
    text(this.letter, this.x + this.w / 2, this.y + this.h -40);
    text(this.btn, this.x + this.w / 2, this.y + this.h - 22);
  }
}

// ******  music  start ******//
function keyPressed() {
  let letter = key.toUpperCase();
  let matchedKey = keys.find(k => k.btn === letter);
  let reverb= new p5.Reverb(); // 
  if (matchedKey && !oscillators[letter]) {
    matchedKey.pressed = true; // pressed become ture
    let osc = new p5.Oscillator('triangle');// square,sine,triangle
    osc.freq(matchedKey.freq);
    osc.amp(0.4);
    osc.start();
    reverb.process(osc, 3, 2); // with osc ,will have a lofi effect
    oscillators[letter] = osc;
  }
}

function keyReleased() {
  let letter = key.toUpperCase();
  let matchedKey = keys.find(k => k.btn === letter);
  
  if (matchedKey) {
    matchedKey.pressed = false; // reset status
  }

  if (oscillators[letter]) {
    oscillators[letter].stop();
    delete oscillators[letter];
  }
}

// ******  draw bar  start ******//
function drawBars() {
  keys.forEach((k) => {
    if (k.pressed) {
      // bars's position is from key's 
      let x = k.x;
      let y =0 ; // start from the top of canvas
      let w = k.w;
      let n = 10; // 10 keys

      noStroke();
      for (let j = 0; j < n; j++) {      
        drawAlphaGradient(x, y, w, height - 200);
      }
    }
  });
}

function drawAlphaGradient(x, y, w, h) {

for (let i = 0; i < h; i++) {
  let hue = map(i, 0, h, 40, 100);        // hue gradient setting 
  let alpha = map(i, 0, h, 1, 10);        // alpha start 1% to 10%
  fill(hue, 40, 100, alpha);              
  noStroke();
  rect(x, y + i, w, 1);
}
}

// ******  swirls start ******//
function drawSwirls(time, rotation) {
  for (let d = 0; d < 360; d += 10) {
    scale(0.84);               // lower make all swirls became smaller
    rotate(rotation);          // rotate
    let hue = (time + d) % 100;
    fill(hue, 60, 100);         

    let r = d + time / width;  // with the time to rotate
    let x = cos(r) * width / 2;
    let y = sin(r) * height / 2;
    let size = (sin(time / 10 - d * 9) % 10) * d;

    ellipse(x, y, size,size);        // draw circle
  }
}