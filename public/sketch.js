
// var BboxText = require("p5-bbox-aligned-text");


var debug = true

var garden;

var font;
const fontSize = 32;

function preload() {
  font = loadFont('assets/times-new-roman.ttf');
}

function setup() {
  garden = new Garden(640, 640)
  
}

function draw() {
  garden.update()
  garden.render()

  if (mouseIsPressed) {
    let word;
    if (debug) {
      word = new Word(mouseX, mouseY, wordTypes.STALK)
    } else {
      word = new Word(mouseX, mouseY, garden.selectedWordType)
    }
    if (garden.canAddWord(word)) {
      garden.addWord(word);
    }
  }
}

// the universe that handles simulation steps
Garden = function(w, h) {
  this.words = [];

  this.w = w
  this.h = h

  this.fontSize = fontSize;

  this.bg_col = color(220);
  
  this.canvas = createCanvas(640, 640);
  this.canvas.parent(document.getElementById('sketch-holder'))

  var toolbar = document.getElementById('toolbar')

  // set up garden toolbar
  // clear button
  createButton('Clear').parent(toolbar).mousePressed(() => clearGarden());

  // types of words
  createButton('earth').parent(toolbar).mousePressed(
    () => selectWord(wordTypes.EARTH));
  createButton('seed').parent(toolbar).mousePressed(
    () => selectWord(wordTypes.SEED));
  createButton('water').parent(toolbar).mousePressed(
    () => selectWord(wordTypes.WATER));

  textFont(font);
  textSize(this.fontSize)

  // default to earth
  this.selectedWordType = wordTypes.EARTH;

  // steps since the simulation started
  this.steps = 0
}

Garden.prototype.render = function() {
  background(this.bg_col)
  for (let i = 0; i < this.words.length; i++) {
    this.words[i].draw()
  }
}

Garden.prototype.addWord = function(word) {
  this.words.push(word)
}

Garden.prototype.removeWord = function(word) {
  let i = 0;
  for (; i < this.words.length; i++) {
    if (Object.is(this.words[i], word)) {
      break;
    }
  }
  this.words.splice(i, 1)
}

Garden.prototype.canAddWord = function(word) {
  return this.inBounds(word) && !this.overlapWord(word);
}

Garden.prototype.inBounds = function(word) {
  let bbox = word.getBbox()
  let inBounds = !(bbox.x < 0 || bbox.y < 0 ||
           bbox.x + bbox.w > this.w || 
           bbox.y + bbox.h > this.h);
  return inBounds
}

// returns null if no overlap
// returns the overlapping word if there is an overlap
Garden.prototype.overlapWord = function(word) {
  for (let i = 0; i < this.words.length; i++) {
    if (this.words[i] != word && this.words[i].overlap(word)) {
      return this.words[i];
    }
  }
  return null;
}

Garden.prototype.update = function() {
  for (let i = 0; i < this.words.length; i++) {
    this.words[i].update()
    if (debug && this.steps % 100 == 0) {
      print(this.words[i])
    }
  }

  this.steps += 1
}

Garden.prototype.startPlant = function(earth) {
  // spawn a stalk on top of the earth
  // make it like sideways
  //

  let stalk = new Word(mouseX, mouseY, wordTypes.STALK);


  

}

// todo: make these button callbacks not global functions
// (should be Garden class functions)
function clearGarden() {
  garden.words = [];
}

function selectWord(wordType) {
  garden.selectedWordType = wordType;
}

const wordTypes = {
  DEFAULT: {
    text: 'word',
    color: [0, 0, 0],
    rotated: false,
  },
  TEST_LONG: {
    text: 'longerword',
    color: [0, 0, 0],
    rotated: false,
  },
  EARTH: {
    text: 'earth',
    color: [59, 29, 0],
    rotated: false,
  },
  SEED: {
    text: 'seed',
    color: [235, 235, 19],
    rotated: false,
  },
  WATER: {
    text: 'water',
    color: [26, 68, 235],
    rotated: false,
  },
  STALK: {
    text: 'stalk',
    color: [102, 153, 0],
    rotated: true,
  }
}

Word = function(x, y, type) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.text = type.text;
  this.color = color(type.color[0], type.color[1], type.color[2]);

  this.rotated = type.rotated;


  // used for some debugging
  this.debug = false;
};

Word.prototype.getBbox = function() {
  // kind of a hack. yay p5
  let bounds = font.textBounds(this.text, this.x, this.y, this.fontSize);

  return bounds;
}

Word.prototype.overlap = function(word) {
  let bboxa = this.getBbox()
  let bboxb = word.getBbox()

  let la = bboxa.x
  let ra = bboxa.x + bboxa.w
  let ta = bboxa.y
  let ba = bboxa.y + bboxa.h

  let lb = bboxb.x
  let rb = bboxb.x + bboxb.w
  let tb = bboxb.y
  let bb = bboxb.y + bboxb.h

  // thank u stackoverlfow
  // https://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
  if (la <= rb && ra >= lb && ta <= bb && ba >= tb) {
    return true;
  } else {
    this.debug = false
    return false;
  }

}

Word.prototype.draw = function() {
  // draw the text

  // if (this.rotated) {
  // }
  //

  
  push()
  translate(this.x, this.y)
  if (this.rotated) {
    rotate(- PI / 2.0);
  }
  fill(this.color)
  noStroke()
  text(this.type.text, 0, 0)
  pop()

  if (debug) {
    // draw bounds
    push();
    noFill();
    stroke(color(255, 0, 0));
    let bbox = this.getBbox();
    rect(bbox.x, bbox.y, bbox.w, bbox.h);
  }

};

Word.prototype.update = function() {

  // todo: can optimize this by making it compare indices instead of strings
  switch(this.text) {
    case 'earth':
      this.updateEarth()
      break;
    case 'seed':
      this.updateSeed()
      break;
    case 'water':
      this.updateWater()
      break;
    case 'stalk':
      this.updateStalk()
      break;
  }

}

Word.prototype.updateEarth = function() {
  // try to make it fall, unless it collides with something
  this.y += 1
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    this.y -= 1
  }
}

Word.prototype.updateSeed = function() {
  // try to make it fall, unless it collides with something
  this.y += 1
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    this.y -= 1
  }
}


Word.prototype.updateWater = function() {
  // try to make it fall, unless it collides with something
  this.y += 1
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    this.y -= 1
  }

  // check if we're touching a seed, that is touching earth
  // if so, delete the seed, and start growing a plant from the earth
  //
  // are we resting on something?
  let underThis = this.restingOn()

  // if water touches something, it disappears
  if (underThis) {
    garden.removeWord(this)
  }

  // if water is on a seed, which is on a earth, starts growing a plant!
  if (underThis && underThis.text == 'seed') {
    let underSeed = underThis.restingOn()
    if (underSeed && underSeed.text == 'earth') {
      garden.removeWord(underThis)
      garden.startPlant(underSeed)
    }
  }

}

Word.prototype.updateStalk = function() {
  // try to make it fall, unless it collides with something
  this.y += 1
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    this.y -= 1
  }

}

// are we resting on a word? returns that word, or null
Word.prototype.restingOn = function() {
  this.y += 1;
  let wordUnder = garden.overlapWord(this);
  this.y -= 1;
  return wordUnder;
}




