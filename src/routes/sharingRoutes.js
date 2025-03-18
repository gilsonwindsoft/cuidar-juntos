// src/routes/sharingRoutes.js - Rotas para compartilhamento
const express = require('express');
const router = express.Router();
const sharingController = require('../controllers/sharingController');

router.post('/', sharingController.createShareLink);
router.get('/:shareId', sharingController.viewSharedCalendar);

module.exports = router;