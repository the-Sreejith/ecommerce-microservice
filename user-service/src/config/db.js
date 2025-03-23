const { Sequelize } = require('sequelize');
const dbConfig = require('./config');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
    logging: dbConfig.logging
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Initialize database connection
testConnection();

// Graceful shutdown
process.on("SIGINT", async () => {
  await sequelize.close();
  console.log("Database connection closed");
  process.exit(0);
});

module.exports = sequelize;


// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// const syncDB = async () => {
//     try {
//       await sequelize.sync(); 
//       console.log("✅ Database & tables created!");
//     } catch (error) {
//       console.error("❌ Error syncing database:", error);
//     }
//   };


// dotenv.config();

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'postgres',
//     logging: false,  
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         }
//     }
// });  

// async function testDBConnection() {
//   try {
//       await sequelize.authenticate(); // Sequelize's method to check DB connection
//       console.log('✅ Database connected successfully.');
//   } catch (error) {
//       console.error('❌ Database connection failed:', error.message);
//   }
// }


// testDBConnection();
// syncDB();


// export default sequelize;