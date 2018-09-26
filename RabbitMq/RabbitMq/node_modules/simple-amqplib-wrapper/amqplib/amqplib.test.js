const should = require('should');
const AmqpLib = require('./amqplib');
const testMessage = { message: 'message' };
let consumedRawMessage;

describe('AMQPLIB', () => {
  it('Should create an instance of AMQPLIB', () => {
    const Amqp = new AmqpLib('amqp://localhost');
    should.exist(Amqp);
  });

  it('Should create a channel using AMQP', async() => {
    const Amqp = new AmqpLib('amqp://localhost');
    const data = await Amqp.assertQueue('testQueue', {durable: true});
    data.should.have.property('consumerCount');
    data.should.have.property('messageCount');
    data.should.have.property('queue');
  });

  it('Should send a message to queue', async()  => {
    const Amqp = new AmqpLib('amqp://localhost');
    const isDataSent = await Amqp.sendToQueue('testQueue', { message: 'message' });
    isDataSent.should.be.true();
  });

  it('Should consume stream from queue', (done) => {
    const Amqp = new AmqpLib('amqp://localhost');
    const messageStream = Amqp.consumeStream('testQueue', {noAck: false});
    messageStream
      .take(1)
      .each(async(message) => {
        consumedRawMessage = message;
        const parsedMessage = message.content.toString();
        parsedMessage.should.be.equal(JSON.stringify(testMessage));
      })
      .done(done);
  });

  it('Should acknowledge the channel about the message recieved', async() => {
    const Amqp = new AmqpLib('amqp://localhost');
    const ackStatus = await Amqp.acknowledge(consumedRawMessage);
    should.exist(ackStatus);
  });

  it('Should delete a channel using AMQP', async() => {
    const Amqp = new AmqpLib('amqp://localhost');
    const deletedQueue = await Amqp.deleteQueue('testQueue');
    deletedQueue.should.have.property('messageCount');
  });
});
