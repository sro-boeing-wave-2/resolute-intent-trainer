let busboy = require('connect-busboy')
var express = require('express');
var fs = require('fs-extra');
var app = express();
let service = require('./recastTrainer');
const request = require('superagent');
let recastData = [];
const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE,RECAST_AUTHORIZATION } = require('./app.config');
const functions = require('./RecastFunctions');
const amqplib = require('amqplib');

// SERVER 
app.use(busboy());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/intent/getIntent', function (req, response) {
    request
    .get(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
    .send()
    .set('Authorization', RECAST_AUTHORIZATION)
    .end((err, res) => {
        recastData = [];
        data = JSON.parse(res.text);
        [data.results.forEach(element => {
            recastData.push(element.name)    
        })]
        response.send(recastData)
    }
)   
})

app.post('/intent/upload', function (req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var fstream = fs.createWriteStream('./Data/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send('upload succeeded!');
            service.action(); // recast trainer 
        });
    });
});


var server = app.listen(80, function () {
    console.log('Listening on port %d', server.address().port);
});





