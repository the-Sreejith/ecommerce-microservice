const amqp = require('amqplib');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

let connection = null;
let channel = null;

// RabbitMQ connection settings
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const ADMIN_CHECK_QUEUE = process.env.ADMIN_CHECK_QUEUE || 'admin_check';
const INVENTORY_NOTIFICATION_QUEUE = process.env.INVENTORY_NOTIFICATION_QUEUE || 'inventory_notification';

/**
 * Initialize connection to RabbitMQ
 */
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Ensure queues exist
    await channel.assertQueue(ADMIN_CHECK_QUEUE, { durable: true });
    await channel.assertQueue(INVENTORY_NOTIFICATION_QUEUE, { durable: true });
    
    logger.info('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    throw error;
  }
}

/**
 * Close RabbitMQ connection
 */
async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('Closed RabbitMQ connection');
  } catch (error) {
    logger.error(`Error closing RabbitMQ connection: ${error.message}`);
  } finally {
    channel = null;
    connection = null;
  }
}

/**
 * Get RabbitMQ channel
 */
function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ not initialized. Call connectRabbitMQ first.');
  }
  return channel;
}

module.exports = {
  connectRabbitMQ,
  closeRabbitMQ,
  getChannel,
  ADMIN_CHECK_QUEUE,
  INVENTORY_NOTIFICATION_QUEUE
}; 