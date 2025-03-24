const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const dotenv = require('dotenv');

dotenv.config();

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create document client from the DynamoDB client
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Define the DynamoDB product table name
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products';

module.exports = {
  dynamoClient,
  docClient,
  PRODUCTS_TABLE,
}; 