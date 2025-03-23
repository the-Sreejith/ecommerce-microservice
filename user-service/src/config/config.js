require('dotenv').config();

module.exports = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "ecommerce_user_service",
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
