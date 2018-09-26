const request = require('superagent');
const { USER_SLUG, BOT_SLUG, RABBITMQ_QUEUE, RECAST_AUTHORIZATION } =
  require('./app.config');

const amqplib  = require('amqplib')

// const createOrUpdateIntentOnRecast = (msg) => {
//   if (msg !== null) {
//     var data = JSON.parse(msg.content);
//     var route = msg.properties.headers["action"];
//     if (route == "create") {
//       data.expression.forEach(element, index => {
//         if (index == 0)
//           CreateIntent(USER_SLUG, BOT_SLUG, data.intent, data.description, element)
//         else
//           AddToIntent(USER_SLUG, BOT_SLUG, element, data.intent.toLowerCase())
//       });
//       channel.ack(msg);
//     }
//     else if (route == "update") {
//       AddToIntent(USER_SLUG, BOT_SLUG, data.expression[0], data.intent.toLowerCase())
//       channel.ack(msg);
//     }
//   }
// };

// module.exports = (async () => {
//   const q = RABBITMQ_QUEUE;
//   const connection = await amqplib.connect('amqp://localhost');
//   const channel = connection.createChannel();
//   channel.assertQueue(q).then(function (ok) {
//     channel.consume(q, createOrUpdateIntentOnRecast(msg));
//   }
// )
// }
// )


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
          CreateIntent(USER_SLUG, BOT_SLUG, data.intent, data.description, data.expressions);
          ch.ack(msg);
        }
        else if (route == "update") 
        {
          console.log(data.intent);
          AddToIntent(USER_SLUG, BOT_SLUG, data.expression[0], data.intent.toLowerCase())
          ch.ack(msg);
        }
      }
    });
  });
}).catch(console.warn);




CreateIntent = (USER_SLUG, BOT_SLUG, NAME, DESCRIPTION, QUERY) => {
  request
    .post(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
    .send({
      name: NAME,
      description: DESCRIPTION,
      expressions: QUERY    
    })
    .set('Authorization', RECAST_AUTHORIZATION)
    .end((err, res) => console.log(res.text));
}

AddToIntent = (USER_SLUG, BOT_SLUG, QUERY, INTENT_SLUG) => {
  request
    .post(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents/${INTENT_SLUG}/expressions`)
    .send({
      source: QUERY,
      language: { isocode: 'en' }
    })
    .set('Authorization', RECAST_AUTHORIZATION)
    .end((err, res) => console.log(res.text));
};

