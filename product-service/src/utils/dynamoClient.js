const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? {
        endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
        }
      }
    : {})
});

// Create document client for easier interaction with DynamoDB
const docClient = DynamoDBDocumentClient.from(dynamoClient);

module.exports = { dynamoClient, docClient };


