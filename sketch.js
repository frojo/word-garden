
var debug = false

var garden;

function setup() {
  garden = new Garden(640, 640)
}

function draw() {
  garden.update()
  garden.render()

  if (mouseIsPressed) {
    let word = new Word(mouseX, mouseY, garden.selectedWordType)
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

  this.font = loadFont('assets/times-new-roman.ttf')
  this.fontSize = 32;

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

  textFont(this.font);
  textSize(this.fontSize)

  // default to earth
  this.selectedWordType = wordTypes.EARTH;
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
  }
}

Garden.prototype.startPlant = function(earth) {

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
  },
  TEST_LONG: {
    text: 'longerword',
    color: [0, 0, 0],
  },
  EARTH: {
    text: 'earth',
    color: [59, 29, 0],
  },
  SEED: {
    text: 'seed',
    color: [235, 235, 19],
  },
  WATER: {
    text: 'water',
    color: [26, 68, 235],
  }
}

Word = function(x, y, type) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.text = type.text;
  this.color = color(type.color[0], type.color[1], type.color[2]);

  // used for some debugging
  this.debug = false
};

Word.prototype.getBbox = function() {
  return garden.font.textBounds(this.text, 
                                this.x, this.y, this.fontSize)
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
  fill(this.color)
  noStroke()
  text(this.type.text, this.x, this.y)

  if (debug) {
    // draw a red debug bounding box
    let bbox = this.getBbox()
    noFill()
    if (this.debug) {
      stroke(color(0, 255, 0))
    }
    else {
      stroke(color(255, 0, 0))
    }
    rect(bbox.x, bbox.y, bbox.w, bbox.h)
  }
};

Word.prototype.update = function() {
  // try to make it fall, unless it collides with something
  this.y += 1
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    this.y -= 1
  }

  // todo: can optimize this by making it compare indices instead of strings
  switch(this.text) {
    case 'earth':
      break;
    case 'seed':
      break;
    case 'water':
      this.updateWater()
      break;
  }

}

Word.prototype.updateWater = function() {
  // check if we're touching a seed, that is touching earth
  // if so, delete the seed, and start growing a plant from the earth
  

  // problem: what if the earth is under some other earth or thing?
  // should the plant just delete the earth above it? yeah I think so
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

// are we resting on a word? returns that word, or null
Word.prototype.restingOn = function() {
  this.y += 1;
  let wordUnder = garden.overlapWord(this);
  this.y -= 1;
  return wordUnder;
}




