
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
    garden.addWord(word);
  }
}


// the universe that handles simulation steps
Garden = function(w, h) {
  this.words = [];

  this.w = w
  this.h = h

  this.font = loadFont('assets/times-new-roman.ttf')
  print(this.font)
  this.fontSize = 32;
  print(this.font)
  
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
  // idk how the fuck
  this.words.push(word)

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
  
  // make a box2D physics object around it
  let text = this.type.text;
  let bbox = garden.font.textBounds(text, this.x, this.y, this.fontSize)

  // ok supposedly we have the bbox there
};

Word.prototype.getBbox = function() {
  return garden.font.textBounds(this.text, 
                                this.x, this.y, this.fontSize)
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
    stroke(color(255, 0, 0))
    rect(bbox.x, bbox.y, bbox.w, bbox.h)
  }
};
