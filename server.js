
var express = require('express');

var app = express();
var server = app.listen(3000)

app.use(express.static('public'));

app.get('/p5-bbox-aligned-text.js', function(req, res) {
      res.sendFile(__dirname + '/node_modules/p5-bbox-aligned-text/dist/bbox-aligned-text.js');
});
