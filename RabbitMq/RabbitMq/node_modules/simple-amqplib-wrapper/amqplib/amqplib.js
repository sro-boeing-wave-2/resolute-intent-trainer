const highland = require('highland');
const amqp = require('amqplib/callback_api');
const promisify = require('util').promisify;
const amqpConnect = promisify(amqp.connect);

class AmqpLib {
  /**
   * Creates an instance of AmqpLib
   * 
   * @param {string} host
   * @param {Object} socketOptions 
   * @memberof AmqpLib
   */
  constructor(host, socketOptions) {
    this.host = host;
    this.options = socketOptions;
  }

  /**
   * Connects to the RabbitMQ
   * 
   * @returns Connection
   * @memberof AmqpLib
   */
  async connect() {
    if(AmqpLib.connections.get(this.host)) {
      this.connection = AmqpLib.connections.get(this.host);
    } else {
      this.connection = await amqpConnect(this.host);
      AmqpLib.connections.set(this.host, this.connection);
    }
    return this.connection;
  }

  /**
   * Creates an AMQP Channel to communicate with RabbitMQ
   * 
   * @returns Channel
   * @memberof AmqpLib
   */
  async channel() {
    if(AmqpLib.channels.get(this.host)) {
      this.amqpChannel = AmqpLib.channels.get(this.host);
    } else {
      const connection = await this.connect();
      this.amqpChannel = connection.createChannel();
      AmqpLib.channels.set(this.host, this.amqpChannel);
    }
    return this.amqpChannel;
  }

  /**
   * Creates a queue in RabbitMQ. 
   * 
   * @param {string} queue 
   * @param {Object} options 
   * @returns Queue 
   * @memberof AmqpLib
   */
  async assertQueue(queue, options) {
    const channel = await this.channel();
    const assertQueue = promisify(channel.assertQueue.bind(channel));
    return await assertQueue(queue, options);
  }

  /**
   * Deletes a queue from RabbitMQ
   * 
   * @param {String} queue 
   * @param {Object} (optional) options 
   * @returns {Boolean} deleteStatus
   * @memberof AmqpLib
   */
  async deleteQueue(queue, options) {
    const channel = await this.channel();
    const deleteQueue = promisify(channel.deleteQueue.bind(channel));
    let deleteStatus;
    try {
      deleteStatus = await deleteQueue(queue, options);
    } catch(exception) {
      this.channel = null;
      deleteStatus = true;
    }
    return deleteStatus;
  }

  /**
   * Sends a message to the queue.
   * 
   * @param {String} queue 
   * @param {Object} msgObj 
   * @param {Object} (optional) options 
   * @returns {Boolean} sendStatus
   * @memberof AmqpLib
   */
  async sendToQueue(queue, msg, options) {
    const channel = await this.channel();
    const sendStatus = channel.sendToQueue(queue, new Buffer(JSON.stringify(msg)), options);
    return sendStatus;
  }

  /**
   * Returns a message stream from the queue.
   * 
   * @param {String} queue 
   * @returns {Stream} MessageStream
   * @memberof AmqpLib
   */
  consumeStream(queue, options) {
    return highland(async(push) => {
      const channel = await this.channel();
      channel.consume(queue, (msg) => {
        push(null, msg);
      }, options);
    });
  }

  /**
   * Acknowledges the message to RabbitMQ
   * 
   * @param {Object} message 
   * @param {Boolean} allUpTo 
   * @returns {Boolean} ackStatus
   * @memberof AmqpLib
   */
  async acknowledge(message, allUpTo) {
    const channel = await this.channel();
    return channel.ack(message, allUpTo);
  }
}

AmqpLib.connections = new Map();
AmqpLib.channels = new Map();

module.exports = AmqpLib;
