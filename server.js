let busboy = require('connect-busboy')
var express = require('express');
var fs = require('fs-extra');
var app = express();
let service = require('./recastTrainer');
const request = require('superagent');
const { USER_SLUG, BOT_SLUG} =
  require('./app.config');

app.use(busboy());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.post('/upload', function (req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var fstream = fs.createWriteStream('./Data/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send('upload succeeded!');
            service.action();
        });
    });
});

app.get('/getIntent', function (req, response) {
    var data;

    request
        .get(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
        .send()
        .set('Authorization', 'Token 286f39a783c97af71459a71423620eec')
        .end((err, res) => {
            data = (res.text);
            console.log(JSON.stringify(data));
            response.json(data);
        });
})
var server = app.listen(8080, function () {
    console.log('Listening on port %d', server.address().port);
});