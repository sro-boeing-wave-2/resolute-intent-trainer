var express = require('express');
var fs = require('fs-extra');
var app = express();
let service = require('./recastTrainer');
const request = require('superagent');
const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE,RECAST_AUTHORIZATION } = require('./app.config');
const functions = require('./RecastFunctions');
const amqplib = require('amqplib');
const path = require('path');
const multer = require('multer');

// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Get all the intents from recast
app.get('/intent/getIntent', (req, response) => {
  request
  .get(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
  .send()
  .set('Authorization', RECAST_AUTHORIZATION)
  .end((err, res) => {
    const data = JSON.parse(res.text);
    const recastIntents = data.results.map(intent => intent.name);
    response.send(recastIntents);
  });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, './Data'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage }).single('training');

app.post('/intent/upload', upload, (req, res, next) => {
    service.action(req.file.path);
    res.send('Done');
});


var server = app.listen(8080, function () {
    console.log('Listening on port %d', server.address().port);
});
