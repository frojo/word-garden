
var debug = false;

var garden;

var font;
const fontSize = 32;

function preload() {
  font = loadFont('assets/times-new-roman.ttf');
}

function setup() {
  garden = new Garden(640, 640)


  if (debug) {
    let earth = new Word(320, 600, wordTypes.EARTH);
    if (garden.canAddWord(earth)) {
      garden.addWord(earth);
      let plant = new Plant();
      plant.start(earth);
    }
  }
  
}

function draw() {
  garden.update()
  garden.render()

  if (mouseIsPressed) {
    let word;
    if (debug) {
      // word = new Word(mouseX, mouseY, wordTypes.EARTH)
      // if (garden.canAddWord(word)) {
      //   garden.addWord(word);
      //   let plant = new Plant();
      //   plant.start(word);
      // }
      word = new Word(mouseX, mouseY, wordTypes.WATER)
      if (garden.canAddWord(word)) {
        garden.addWord(word);
      }
    } else {
      word = new Word(mouseX, mouseY, garden.selectedWordType)
      if (garden.canAddWord(word)) {
        garden.addWord(word);
      }
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
  
  this.canvas = createCanvas(w, h);
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
  textSize(this.fontSize);
  textAlign(LEFT, BOTTOM);

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
    color: [50, 171, 78],
    rotated: true,
  },
  LEAF: {
    text: 'leaf',
    color: [102, 171, 50],
    rotated: false,
  },
  PEDAL: {
    text: 'pedal',
    color: [145, 49, 148],
    rotated: false,
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

  if (this.rotated) {
    // textAlign() affects what textBounds() returns
    // p5 is wild yall
    push()
    textAlign(LEFT, BASELINE);
    let bounds = font.textBounds(this.text, this.x, this.y, this.fontSize);
    pop()
    let newBounds = {
      x: bounds.x - bounds.h,
      y: bounds.y + bounds.h - bounds.w,
      w: bounds.h,
      h: bounds.w,
    }
    return newBounds;
  } else {
    return font.textBounds(this.text, this.x, this.y, this.fontSize);
  }
    
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
    return false;
  }

}

Word.prototype.draw = function() {

  // draw text
  push()
  translate(this.x, this.y)
  if (this.rotated) {
    textAlign(LEFT, BASELINE);
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
    if (this.debug) {
      // noFill();
      // stroke(color(255, 0, 0));
      // ellipse(this.topmid.x, this.topmid.y, 5);
    }
    // draw a elipse at x and y
    stroke(color(0, 255, 0));
    ellipse(this.x, this.y, 5);
    stroke(color(0, 0, 255));
    ellipse(bbox.x, bbox.y, 5);
    pop();
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
  let collided = false;
  if (!garden.inBounds(this) || garden.overlapWord(this)) {
    collided = true;
    this.y -= 1
  }

  // are we resting on something?
  let underThis = this.restingOn()

  // if water lands on something, it disappears
  if (underThis || collided) {
    garden.removeWord(this)
  }

  // if water is on a seed, which is on a earth, starts growing a plant!
  if (underThis && underThis.text == 'seed') {
    let underSeed = underThis.restingOn()
    if (underSeed && underSeed.text == 'earth') {
      // delete the seed
      garden.removeWord(underThis)

      let plant = new Plant();
      plant.start(underSeed);
    }
  }

  // if water is on a stalk, it continues to grow the plant
  if (underThis && underThis.text == 'stalk') {
    let stalk = underThis;
    stalk.plant.grow();
  }
}

Word.prototype.updateStalk = function() {
  // note: stalks don't fall. unlike stocks during corona

}

// are we resting on a word? returns that word, or null
Word.prototype.restingOn = function() {
  this.y += 1;
  let wordUnder = garden.overlapWord(this);
  this.y -= 1;
  return wordUnder;
}

const pedalColors = [
  [145, 49, 148], // purple
  [230, 23, 126], // pink?
  [232, 21, 42], // red (like roses)
  [60, 35, 204], // blue
  [255, 255, 242], // cream
  [247, 239, 89] // yellow
]

// in the future, we could have different plant types
//

// a composite of words with some more meta info
Plant = function() {
  // this.pedalCol = color(145, 49, 148);
  this.pedalCol = random(pedalColors);

  this.lastWord = null;

  this.step = 0;
}


Plant.prototype.start = function(earth) {
  // spawn a stalk on top of the earth
  let stalk = new Word(0, 0, wordTypes.STALK);
  let stalkBbox = stalk.getBbox();
  let earthBbox = earth.getBbox();

  // i'm not even going to explain why these calculations work. ok fine
  // it has to do with how the stalk isn't reeeeeally rotated. it just
  // looks like it. so really when we spawn it, it's spawned as if it wasn't
  // rotated...
  stalk.x = earthBbox.x + earthBbox.w/2 + stalkBbox.w/2;
  stalk.y = earthBbox.y;
  stalk.plant = this;
  garden.addWord(stalk);

  this.lastWord = stalk;
  this.step += 1
}

Plant.prototype.grow = function(earth) {
  if (this.step == 0) {


  // add a stalk, with a leaf
  } else if (this.step == 1) {
    let firstStalk = this.lastWord;
    let firstBbox = firstStalk.getBbox();

    // add a new stalk on top of the first talk
    let newStalk = new Word(0, 0, wordTypes.STALK);
    let newBbox = newStalk.getBbox();
    newStalk.x = firstBbox.x + newBbox.w
    newStalk.y = firstBbox.y
    newStalk.plant = this;
    garden.addWord(newStalk);

    // add a lil leaf going off the first stalk
    let leaf = new Word(0, 0, wordTypes.LEAF);
    let leafBbox = leaf.getBbox();
    leaf.x = firstBbox.x - leafBbox.w;
    leaf.y = firstBbox.y + leafBbox.h;
    leaf.plant = this;
    garden.addWord(leaf)

    this.lastWord = newStalk;
    this.step += 1

  // add flower pedals
  } else if (this.step == 2) {
    print('turn into a flower!');
    let stalk = this.lastWord;
    let stalkBbox = stalk.getBbox();

    // add another lil leaf going off the second stalk
    let leaf = new Word(0, 0, wordTypes.LEAF);
    let leafBbox = leaf.getBbox();
    leaf.x = stalkBbox.x + stalkBbox.w;
    leaf.y = stalkBbox.y + stalkBbox.h/2 + leafBbox.h;
    leaf.plant = this;
    garden.addWord(leaf)

    // add some pedals on top!
    // let's start with just two for now, symetrically on top

    let pedal_xmid = stalkBbox.x + stalkBbox.w/2;
    let pedal_y = stalkBbox.y

    let pedal1 = new Word(0, 0, wordTypes.PEDAL);
    pedal1.x = pedal_xmid - pedal1.getBbox().w;
    pedal1.y = pedal_y;
    pedal1.color = this.pedalCol
    pedal1.plant = this;
    garden.addWord(pedal1);

    let pedal2 = new Word(0, 0, wordTypes.PEDAL);
    pedal2.x = pedal_xmid;
    pedal2.y = pedal_y;
    pedal2.color = this.pedalCol
    pedal2.plant = this;
    garden.addWord(pedal2);

    let pedal3 = new Word(0, 0, wordTypes.PEDAL);
    pedal3.x = pedal_xmid - pedal3.getBbox().w/2;
    pedal3.y = stalkBbox.y - pedal3.getBbox().h;
    pedal3.color = this.pedalCol
    pedal3.plant = this;
    garden.addWord(pedal3);

    this.step += 1
  } 
}



