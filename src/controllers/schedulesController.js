const moment = require('moment');
const Caregiver = require('../models/Caregiver');
const Schedule = require('../models/Schedule');
const { generateRotation, saveSchedule } = require('../utils/rotationGenerator');
const { Sequelize } = require('../config/database');

// Exibe o calendário
exports.calendar = async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month) : moment().month();
    const year = req.query.year ? parseInt(req.query.year) : moment().year();
    
    const startDate = moment().year(year).month(month).date(1);
    const endDate = moment().year(year).month(month).endOf('month');
    
    const schedules = await Schedule.findAll({
      where: {
        date: {
          [Sequelize.Op.between]: [
            startDate.format('YYYY-MM-DD'),
            endDate.format('YYYY-MM-DD')
          ]
        }
      },
      include: [{ model: Caregiver }],
      order: [['date', 'ASC']]
    });
    
    // Busca todos os cuidadores ativos para o modal de edição
    const caregivers = await Caregiver.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    
    // Organiza os agendamentos por data
    const calendarData = {};
    schedules.forEach(schedule => {
      calendarData[schedule.date] = {
        caregiverId: schedule.caregiverId,
        caregiverName: schedule.Caregiver.name,
        notes: schedule.notes,
        isSpecialArrangement: schedule.isSpecialArrangement
      };
    });
    
    res.render('schedules/calendar', {
      calendarData,
      month,
      year,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      caregivers, // Passando a lista de cuidadores para a view
      moment
    });
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    res.status(500).send('Erro ao buscar calendário');
  }
};

// Exibe formulário para gerar calendário
exports.generateForm = async (req, res) => {
  try {
    const caregivers = await Caregiver.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    
    res.render('schedules/generate', { 
      caregivers,
      moment 
    });
  } catch (error) {
    console.error('Erro ao buscar cuidadores:', error);
    res.status(500).send('Erro ao buscar cuidadores');
  }
};

// Gera e salva o calendário
exports.generate = async (req, res) => {
  try {
    const { startDate, endDate, caregiverOrder } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).send('Datas de início e fim são obrigatórias');
    }
    
    // Processa a ordem dos cuidadores, se enviada
    let orderedCaregiverIds = [];
    if (caregiverOrder && typeof caregiverOrder === 'string') {
      orderedCaregiverIds = caregiverOrder.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }
    
    const rotationSchedule = await generateRotation(startDate, endDate, orderedCaregiverIds);
    await saveSchedule(rotationSchedule);
    
    res.redirect('/calendario');
  } catch (error) {
    console.error('Erro ao gerar calendário:', error);
    res.status(500).send('Erro ao gerar calendário: ' + error.message);
  }
};

// Atualiza um dia específico do calendário
exports.updateDay = async (req, res) => {
  try {
    const { date, caregiverId, notes, isSpecialArrangement } = req.body;
    
    // Procura se já existe um agendamento para esta data
    let schedule = await Schedule.findOne({ where: { date } });
    
    if (schedule) {
      // Atualiza o existente
      await schedule.update({
        caregiverId,
        notes,
        isSpecialArrangement: isSpecialArrangement === 'on' || isSpecialArrangement === true
      });
    } else {
      // Cria um novo
      await Schedule.create({
        date,
        caregiverId,
        notes,
        isSpecialArrangement: isSpecialArrangement === 'on' || isSpecialArrangement === true
      });
    }
    
    res.redirect('/calendario');
  } catch (error) {
    console.error('Erro ao atualizar dia:', error);
    res.status(500).send('Erro ao atualizar dia');
  }
};

// src/controllers/sharingController.js - Controlador para compartilhamento
const { v4: uuidv4 } = require('uuid');
const qrcode = require('qrcode');

// Armazena links de compartilhamento (em memória, pode ser movido para o banco de dados)
const shareLinks = new Map();

// Cria um novo link de compartilhamento
exports.createShareLink = async (req, res) => {
  try {
    const { months, message } = req.body;
    const shareId = uuidv4();
    const expiresAt = moment().add(parseInt(months) || 3, 'months').toDate();
    
    // Configurações do compartilhamento
    const shareConfig = {
      id: shareId,
      createdAt: new Date(),
      expiresAt,
      message: message || 'Calendário compartilhado de cuidados',
      createdBy: 'admin' // Poderia ser um usuário autenticado
    };
    
    // Salva a configuração do compartilhamento
    shareLinks.set(shareId, shareConfig);
    
    // Gera o link completo para compartilhamento
    const shareLink = `${req.protocol}://${req.get('host')}/compartilhar/${shareId}`;
    
    // Gera o QR code
    const qrCodeDataURL = await qrcode.toDataURL(shareLink);
    
    res.render('sharing/share-created', {
      shareLink,
      qrCodeDataURL,
      shareConfig
    });
  } catch (error) {
    console.error('Erro ao criar link de compartilhamento:', error);
    res.status(500).send('Erro ao criar link de compartilhamento');
  }
};

// Exibe o calendário compartilhado
exports.viewSharedCalendar = async (req, res) => {
  try {
    const { shareId } = req.params;
    const shareConfig = shareLinks.get(shareId);
    
    if (!shareConfig || moment(shareConfig.expiresAt).isBefore(moment())) {
      return res.status(404).render('sharing/expired', {
        message: 'Este link de compartilhamento não existe ou expirou'
      });
    }
    
    // Busca os próximos 3 meses de agendamentos
    const startDate = moment().startOf('month');
    const endDate = moment().add(3, 'months').endOf('month');
    
    const schedules = await Schedule.findAll({
      where: {
        date: {
          [Sequelize.Op.between]: [
            startDate.format('YYYY-MM-DD'),
            endDate.format('YYYY-MM-DD')
          ]
        }
      },
      include: [{ model: Caregiver }],
      order: [['date', 'ASC']]
    });
    
    // Organiza os agendamentos por mês e dia
    const calendarByMonth = {};
    schedules.forEach(schedule => {
      const month = moment(schedule.date).format('YYYY-MM');
      if (!calendarByMonth[month]) {
        calendarByMonth[month] = {
          monthName: moment(schedule.date).format('MMMM YYYY'),
          days: {}
        };
      }
      
      calendarByMonth[month].days[schedule.date] = {
        caregiverName: schedule.Caregiver.name,
        caregiverPhone: schedule.Caregiver.phone,
        notes: schedule.notes
      };
    });
    
    res.render('sharing/public-view', {
      calendarByMonth,
      shareConfig,
      moment
    });
  } catch (error) {
    console.error('Erro ao exibir calendário compartilhado:', error);
    res.status(500).send('Erro ao exibir calendário compartilhado');
  }
};
