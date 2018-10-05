const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE, RECAST_AUTHORIZATION } = require('./app.config');
const functions = require('./RecastFunctions');
const amqplib = require('amqplib');
const request = require('superagent');
const dotenv = require('dotenv');

let recastData = [];
request
  .get(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
  .send()
  .set('Authorization', RECAST_AUTHORIZATION)
  .end((err, res) => {
    data = JSON.parse(res.text);
    recastData = [];
    [data.results.forEach(element => {
      recastData.push(element.name)
    })
    ];
  })
dotenv.config({ path: './machine_config/.env' });
console.log(process.env);
const open = amqplib.connect(`amqp://${process.env.MACHINE_LOCAL_IPV4}`);
open.then(function (conn) {
  return conn.createChannel();
}).then(function (ch) {
  return ch.assertQueue(RABBITMQ_QUEUE).then(function (ok) {
    return ch.consume(RABBITMQ_QUEUE, function (msg) {
      if (msg !== null) {
        var data = JSON.parse(msg.content);
        console.log("Message from Queue - ");
        console.log(msg.content);
        console.log(data);
        if (data.Intent != null) {
          console.log(recastData);
          if (recastData.lastIndexOf(data.intent) == -1) {
            recastData.push(data.Intent.toLowerCase());
            functions.
              CreateIntent(USER_SLUG, BOT_SLUG, data.Intent, data.Description, data.Description);
          }
          else {
            console.log(data.intent);
            functions.
              AddToIntent(USER_SLUG, BOT_SLUG, data.Description, data.Intent.toLowerCase())
          }
        }
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);
