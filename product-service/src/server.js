const app = require('./app');
const { connectRabbitMQ, closeRabbitMQ } = require('./config/rabbitmq');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3001;

/**
 * Initialize the server
 */
async function startServer() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Product service running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeRabbitMQ();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeRabbitMQ();
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer }; 