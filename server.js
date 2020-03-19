
var express = require('express');

var app = express();
var server = app.listen(3000)

app.use(express.static('public'));

app.get('/p5-bbox-aligned-text.min.js', function(req, res) {
      console.log('run our custom get func');
      res.sendFile(__dirname + '/node_modules/p5-bbox-aligned-text/dist/bbox-aligned-text.min.js');
});
