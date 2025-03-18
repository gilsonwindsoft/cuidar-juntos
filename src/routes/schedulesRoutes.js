// src/routes/schedulesRoutes.js - Rotas para o calendário
const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');

router.get('/', schedulesController.calendar);
router.get('/gerar', schedulesController.generateForm);
router.post('/gerar', schedulesController.generate);
router.post('/atualizar-dia', schedulesController.updateDay);

module.exports = router;