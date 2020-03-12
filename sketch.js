
var debug = true;

var garden;

function setup() {
  garden = new Garden(640, 640)
}

function draw() {
  garden.render()

  // ellipse(50, 50, 80, 80);
  if (mouseIsPressed) {
    let word = new Word(mouseX, mouseY, wordTypes.DEFAULT)
    print('try to put a word')
    if (!garden.overlapWord(word)) {
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
  
  createCanvas(640, 640);
  background(220);
  textFont(this.font);
  textSize(this.fontSize)
}

Garden.prototype.render = function() {
  for (let i = 0; i < this.words.length; i++) {
    this.words[i].draw()
  }
}

Garden.prototype.addWord = function(word) {
  this.words.push(word)
}

// returns true iff given word would overlap with a word in the garden
Garden.prototype.overlapWord = function(word) {
  for (let i = 0; i < this.words.length; i++) {
    if (this.words[i].overlap(word)) {
      print('overlap!')
      print(word.getBbox())
      print(this.words[i].getBbox())
      return true;
    }
  }
  print('no overlap!')
  print(word.getBbox())
  return false;
}


Garden.prototype.update = function() {
}


const wordTypes = {
  DEFAULT: {
    text: 'word',
    color: [0, 0, 0],
  },
  EARTH: {
    text: 'earth',
    color: [59, 29, 0],
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
    this.debug = true
    print('word ebug!')
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
      print('drawing debug word')
      stroke(color(0, 255, 0))
    }
    else {
      stroke(color(255, 0, 0))
    }
    rect(bbox.x, bbox.y, bbox.w, bbox.h)
  }
};
