const { Sequelize } = require('sequelize');

const config = {
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'majada1812',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'japon',
      logging: console.log, // para debug
};

console.log('Sequelize config:', JSON.stringify(config, null, 2));

const sequelize = new Sequelize(config);

module.exports = sequelize;


