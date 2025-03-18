const { sequelize, Sequelize } = require('../config/database');

const ShareLink = sequelize.define('ShareLink', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = ShareLink;