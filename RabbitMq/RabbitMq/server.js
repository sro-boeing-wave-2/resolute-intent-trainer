let busboy = require('connect-busboy')
var express = require('express');
var fs = require('fs-extra');
var app = express();
app.use(busboy());

app.post('/upload', function(req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        var fstream = fs.createWriteStream('./csv/' + filename); 
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send('upload succeeded!');
        });
    });
});

var server = app.listen(2000, function() {
    console.log('Listening on port %d', server.address().port);
});