// src/routes/caregiversRoutes.js - Rotas para os cuidadores
const express = require('express');
const router = express.Router();
const caregiversController = require('../controllers/caregiversController');

router.get('/', caregiversController.index);
router.get('/novo', caregiversController.create);
router.post('/', caregiversController.store);
router.get('/:id/editar', caregiversController.edit);
router.put('/:id', caregiversController.update);
router.delete('/:id', caregiversController.delete);

module.exports = router;
