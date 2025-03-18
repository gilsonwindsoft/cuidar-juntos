// src/models/Schedule.js - Modelo para o calendário de cuidados
const { sequelize, Sequelize } = require('../config/database');
const Caregiver = require('./Caregiver');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  caregiverId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Caregiver,
      key: 'id'
    }
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  // Para casos onde precisamos fazer trocas específicas
  isSpecialArrangement: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Relação entre os modelos
Schedule.belongsTo(Caregiver, { foreignKey: 'caregiverId' });
Caregiver.hasMany(Schedule, { foreignKey: 'caregiverId' });

module.exports = Schedule;
