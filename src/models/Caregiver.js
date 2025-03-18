// src/models/Caregiver.js - Modelo para os cuidadores (filhos)
const { sequelize, Sequelize } = require('../config/database');

const Caregiver = sequelize.define('Caregiver', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Caregiver;
