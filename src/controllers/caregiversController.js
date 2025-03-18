// src/controllers/caregiversController.js - Controlador para cuidadores
const Caregiver = require('../models/Caregiver');

// Lista todos os cuidadores
exports.index = async (req, res) => {
  try {
    const caregivers = await Caregiver.findAll({
      order: [['name', 'ASC']]
    });
    res.render('caregivers/index', { caregivers });
  } catch (error) {
    console.error('Erro ao buscar cuidadores:', error);
    res.status(500).send('Erro ao buscar cuidadores');
  }
};

// Exibe formulário para criar novo cuidador
exports.create = (req, res) => {
  res.render('caregivers/create');
};

// Salva novo cuidador
exports.store = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    await Caregiver.create({
      name,
      phone,
      email,
      notes
    });
    res.redirect('/cuidadores');
  } catch (error) {
    console.error('Erro ao criar cuidador:', error);
    res.status(500).send('Erro ao criar cuidador');
  }
};

// Exibe formulário para editar cuidador
exports.edit = async (req, res) => {
  try {
    const caregiver = await Caregiver.findByPk(req.params.id);
    if (!caregiver) {
      return res.status(404).send('Cuidador não encontrado');
    }
    res.render('caregivers/edit', { caregiver });
  } catch (error) {
    console.error('Erro ao buscar cuidador:', error);
    res.status(500).send('Erro ao buscar cuidador');
  }
};

// Atualiza cuidador
exports.update = async (req, res) => {
  try {
    const { name, phone, email, notes, active } = req.body;
    const caregiver = await Caregiver.findByPk(req.params.id);
    
    if (!caregiver) {
      return res.status(404).send('Cuidador não encontrado');
    }
    
    await caregiver.update({
      name,
      phone,
      email,
      notes,
      active: active === 'on' || active === true
    });
    
    res.redirect('/cuidadores');
  } catch (error) {
    console.error('Erro ao atualizar cuidador:', error);
    res.status(500).send('Erro ao atualizar cuidador');
  }
};

// Exclui cuidador
exports.delete = async (req, res) => {
  try {
    const caregiver = await Caregiver.findByPk(req.params.id);
    
    if (!caregiver) {
      return res.status(404).send('Cuidador não encontrado');
    }
    
    // Apenas inativa o cuidador em vez de excluir permanentemente
    await caregiver.update({ active: false });
    
    res.redirect('/cuidadores');
  } catch (error) {
    console.error('Erro ao excluir cuidador:', error);
    res.status(500).send('Erro ao excluir cuidador');
  }
};
