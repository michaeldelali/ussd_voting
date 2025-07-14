import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// Load environment variables from .env file
// dotenv.config();

// console.log(process.env.DB_PASSWORD);
// console.log(process.env.DB_USER);
// console.log(process.env.DB_NAME);
// console.log(process.env.DB_HOST);
// console.log(process.env.DB_PORT);
// console.log(process.env.DB_DIALECT);
// console.log(process.env.DB_LOGGING);
// console.log(process.env.DB_POOL_MAX);

// const database = process.env.DB_NAME || 'borbor_carnival_voting';
// const user = process.env.DB_USER || 'carnival';
// const password = process.env.DB_PASSWORD || '';
// const host = process.env.DB_HOST || 'localhost';
// const port = parseInt(process.env.DB_PORT || '3306');
// const sequelize = new Sequelize(database, user, password, {
//     host,
//     port,
//     dialect: 'mysql',
//     logging: false, // Disable logging temporarily
// });

const sequelize = new Sequelize({
  host: 'localhost',
  port: 3306,
  database: 'borbor_carnival_voting',
  username: 'carnival',
  password: '!ferryBerry1@1',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;