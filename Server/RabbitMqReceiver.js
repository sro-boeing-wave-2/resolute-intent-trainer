const request = require('superagent');
const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE,RECAST_AUTHORIZATION } = require('./app.config');
const amqplib = require('amqplib')
const services = require('./RecastFunctions');
let recastData = [];

exports.Listner = function () {
  const open = amqplib.connect('amqp://localhost');
  open.then(function (conn) {
    return conn.createChannel();
  }).then(function (ch) {
    return ch.assertQueue(RABBITMQ_QUEUE).then(function (ok) {
      return ch.consume(RABBITMQ_QUEUE, function (msg) {
        if (msg !== null) {
          var data = JSON.parse(msg.content);
          var route;
          request
            .get(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
            .send()
            .set('Authorization', RECAST_AUTHORIZATION)
            .end((err, res) => {
              data = JSON.parse(res.text);
              [data.results.forEach(element => {
                recastData.push(element.name)
              })
              ];
            });
          if (recastData.lastIndexOf(data.intent) == -1) {
            services.
              CreateIntent(USER_SLUG, BOT_SLUG, data.intent, data.description, data.expressions);
            ch.ack(msg);
          }
          else {
            console.log(data.intent);
            services.
              AddToIntent(USER_SLUG, BOT_SLUG, data.expressions[0], data.intent.toLowerCase())
            ch.ack(msg);
          }
        }
      });
    });
  }).catch(console.warn);
}

