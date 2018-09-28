const request = require('superagent');
const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE} = require('./app.config');
const amqplib = require('amqplib')
const services = require('./RecastFunctions');


const open = amqplib.connect('amqp://localhost');
open.then(function (conn) {
  return conn.createChannel();
}).then(function (ch) {
  return ch.assertQueue(RABBITMQ_QUEUE).then(function (ok) {
    return ch.consume(RABBITMQ_QUEUE, function (msg) {
      if (msg !== null) {
        var data = JSON.parse(msg.content);
        var route = msg.properties.headers["action"];
        if (route == "create") {
          services.
            CreateIntent(USER_SLUG, BOT_SLUG, data.intent, data.description, data.expressions);
          ch.ack(msg);
        }
        else if (route == "update") {
          console.log(data.intent);
          services.
            AddToIntent(USER_SLUG, BOT_SLUG, data.expressions[0], data.intent.toLowerCase())
          ch.ack(msg);
        }
      }
    });
  });
}).catch(console.warn);



