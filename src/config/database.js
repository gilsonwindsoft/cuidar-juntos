// src/config/database.js - Configuração do banco de dados
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do Sequelize baseada nas variáveis de ambiente
const dialectOptions = {};

let sequelize;

// Configuração condicional para diferentes bancos de dados
switch (process.env.DATABASE_DIALECT) {
  case 'mysql':
    sequelize = new Sequelize(
      process.env.DATABASE_NAME,
      process.env.DATABASE_USER,
      process.env.DATABASE_PASSWORD,
      {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: 'mysql',
        dialectOptions
      }
    );
    break;
  case 'postgres':
    sequelize = new Sequelize(
      process.env.DATABASE_NAME,
      process.env.DATABASE_USER,
      process.env.DATABASE_PASSWORD,
      {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: 'postgres',
        dialectOptions
      }
    );
    break;
  default: // SQLite (padrão)
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DATABASE_STORAGE || './database.sqlite',
      logging: process.env.NODE_ENV === 'development'
    });
    break;
}

module.exports = {
  sequelize,
  Sequelize
};
