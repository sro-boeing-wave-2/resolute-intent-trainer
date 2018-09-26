# Simple-Amqplib-Wrapper [![travis](https://travis-ci.org/nishant-jain-94/simple-amqplib-wrapper.svg?branch=dev)](https://travis-ci.org/nishant-jain-94/simple-amqplib-wrapper) [![dependencies](https://david-dm.org/nishant-jain-94/simple-amqplib-wrapper.svg)](https://david-dm.org) [![Coverage Status](https://coveralls.io/repos/github/nishant-jain-94/simple-amqplib-wrapper/badge.svg?branch=master)](https://coveralls.io/github/nishant-jain-94/simple-amqplib-wrapper?branch=master)
[![NPM](https://nodei.co/npm/simple-amqplib-wrapper.png)](https://nodei.co/npm/simple-amqplib-wrapper/)

[Simple Amqplib Wrapper](https://www.npmjs.com/package/simple-amqplib-wrapper) is a wrapper around [amqplib](https://www.npmjs.com/package/amqplib) abstracting all the complexity. Currently works only on [Node v8.0](https://nodejs.org/en/blog/release/v8.0.0/)

## Amqplib vs Simple-Amqplib-Wrapper ?

### Using Amqplib you do this

```
var q = 'tasks';
 
function bail(err) {
  console.error(err);
  process.exit(1);
}
 
// Publisher 
function publisher(conn) {
  conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.sendToQueue(q, new Buffer('something to do'));
  }
}
 
// Consumer 
function consumer(conn) {
  var ok = conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  }
}
 
require('amqplib/callback_api')
  .connect('amqp://localhost', function(err, conn) {
    if (err != null) bail(err);
    consumer(conn);
    publisher(conn);
  });
```

### With [Simple-Amqplib-Wrapper]() it's super simple

```
const Amqp = require('simple-amqplib-wrapper');
const amqp = new Amqp('amqp://localhost');

const q = 'tasks';
const testTask = { message: 'First Task' };

const publisher = () => {
  return amqp.sendToQueue(q, testTask);
};

const consumer = () => {
  amqp.consumeStream(q).take(1).each((msg) => {
    console.log(msg);
    amqp.acknowledge(msg);
  });
};

publisher();
consumer();
```