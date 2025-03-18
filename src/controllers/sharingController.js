const { v4: uuidv4 } = require('uuid');
const qrcode = require('qrcode');
const moment = require('moment');
const Schedule = require('../models/Schedule');
const Caregiver = require('../models/Caregiver');
const ShareLink = require('../models/ShareLink');
const { Sequelize } = require('../config/database');

// Cria um novo link de compartilhamento
exports.createShareLink = async (req, res) => {
  try {
    const { months, message } = req.body;
    const shareId = uuidv4();
    const expiresAt = moment().add(parseInt(months) || 3, 'months').toDate();
    
    // Configurações do compartilhamento
    const shareConfig = {
      id: shareId,
      expiresAt,
      message: message || 'Calendário compartilhado de cuidados',
      createdBy: 'admin' // Poderia ser um usuário autenticado
    };
    
    // Salva a configuração do compartilhamento no banco de dados
    await ShareLink.create(shareConfig);
    
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
    
    // Busca a configuração do compartilhamento no banco de dados
    const shareConfig = await ShareLink.findByPk(shareId);
    
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