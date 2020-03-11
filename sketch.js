
// list of rigidbodies in the scene
var bodies;

var garden;

function setup() {
  garden = new Garden(640, 640)
}

function draw() {
  garden.render()

  // ellipse(50, 50, 80, 80);
}

function mousePressed() {

  garden.addWord(mouseX, mouseY, wordTypes.DEFAULT)

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
    word.draw()
  }
}

Garden.prototype.addWord = function(x, y, type) {
  // idk how the fuck
  //
  word = new Word(x, y, type)
  this.words.push(word)

}

Garden.prototype.update = function() {
}


const wordTypes = {
  DEFAULT: {
    text: 'word',
    color: 200,
  },
  EARTH: {
    text: 'earth',
    color: 200,
  }
}


Word = function(x, y, type) {
  this.x = x;
  this.y = y;
  this.type = type;


  
  // make a box2D physics object around it
  let text = this.type.text;
  let bbox = garden.font.textBounds(text, this.x, this.y, this.fontSize)

  // ok supposedly we have the bbox there
};


// need to have word types


Word.prototype.draw = function() {
  text(this.type.text, this.x, this.y)
};
