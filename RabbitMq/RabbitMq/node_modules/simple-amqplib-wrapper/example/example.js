const Amqp = require('../');
const amqp = new Amqp('amqp://localhost');

const q = 'tasks';
const testTask = { message: 'First Task' };

const publisher = () => {
  return amqp.sendToQueue(q, testTask);
};

const consumer = () => {
  amqp.consumeStream(q).take(1).each((msg) => {
    // console.log(msg);
    amqp.acknowledge(msg);
  });
};

publisher();
consumer();
