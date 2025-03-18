// src/utils/rotationGenerator.js - Utilitário para gerar o rodízio
const moment = require('moment'); 
const Caregiver = require('../models/Caregiver');
const Schedule = require('../models/Schedule');
const { Sequelize } = require('../config/database');
/**
 * Gera o calendário de rodízio baseado nos cuidadores ativos
 * @param {Date} startDate - Data de início do rodízio
 * @param {Date} endDate - Data final do rodízio
 * @param {Array} orderedCaregiverIds - Array com os IDs dos cuidadores na ordem desejada
 * @returns {Array} Array de objetos contendo data e cuidador designado
 */
async function generateRotation(startDate, endDate, orderedCaregiverIds = []) {
  try {
    // Busca todos os cuidadores ativos
    let caregivers;
    
    if (orderedCaregiverIds && orderedCaregiverIds.length > 0) {
      // Se a ordem personalizada foi fornecida, usamos ela para ordenar os cuidadores
      caregivers = [];
      
      // Busca cada cuidador pela ordem especificada
      for (const id of orderedCaregiverIds) {
        const caregiver = await Caregiver.findOne({
          where: { 
            id: id,
            active: true 
          }
        });
        
        if (caregiver) {
          caregivers.push(caregiver);
        }
      }
      
      // Adiciona quaisquer cuidadores ativos que não foram incluídos na ordenação personalizada
      const additionalCaregivers = await Caregiver.findAll({
        where: { 
          active: true,
          id: { [Sequelize.Op.notIn]: orderedCaregiverIds }
        },
        order: [['name', 'ASC']]
      });
      
      caregivers = [...caregivers, ...additionalCaregivers];
    } else {
      // Se nenhuma ordem personalizada foi fornecida, usamos a ordem padrão
      caregivers = await Caregiver.findAll({
        where: { active: true },
        order: [['name', 'ASC']]
      });
    }

    if (caregivers.length === 0) {
      throw new Error('Não há cuidadores ativos para gerar o rodízio');
    }

    const schedule = [];
    let currentDate = moment(startDate);
    const lastDate = moment(endDate);
    let caregiverIndex = 0;

    // Mapeamento de dias da semana para agrupar corretamente
    // 0: Domingo, 1: Segunda, ..., 6: Sábado
    const daysMap = {};
    
    // Configuração para o padrão de rodízio mencionado:
    // seg e ter (1), qua e qui (2), sex, sab e dom (3)
    const dayGroups = {
      1: 0, // Segunda -> grupo 0
      2: 0, // Terça -> grupo 0
      3: 1, // Quarta -> grupo 1
      4: 1, // Quinta -> grupo 1
      5: 2, // Sexta -> grupo 2
      6: 2, // Sábado -> grupo 2
      0: 2  // Domingo -> grupo 2
    };

    // Determina o grupo de dias para a data inicial
    let currentGroup = dayGroups[currentDate.day()];
    let currentCaregiver = caregivers[caregiverIndex % caregivers.length];

    // Gera o calendário até a data final
    while (currentDate.isSameOrBefore(lastDate)) {
      const dayOfWeek = currentDate.day();
      const newGroup = dayGroups[dayOfWeek];
      
      // Se mudamos para um novo grupo, mudamos o cuidador responsável
      if (newGroup !== currentGroup) {
        currentGroup = newGroup;
        caregiverIndex++;
        currentCaregiver = caregivers[caregiverIndex % caregivers.length];
      }
      
      schedule.push({
        date: currentDate.format('YYYY-MM-DD'),
        caregiverId: currentCaregiver.id,
        caregiverName: currentCaregiver.name
      });
      
      currentDate.add(1, 'days');
    }

    return schedule;
  } catch (error) {
    console.error('Erro ao gerar rodízio:', error);
    throw error;
  }
}

/**
 * Salva o calendário gerado no banco de dados
 * @param {Array} schedule - Calendário gerado
 * @returns {Promise}
 */
async function saveSchedule(schedule) {
  try {
    // Exclui agendamentos futuros que não sejam arranjos especiais
    const today = moment().format('YYYY-MM-DD');
    await Schedule.destroy({
      where: {
        date: { [Sequelize.Op.gte]: today },
        isSpecialArrangement: false
      }
    });
    
    // Insere os novos agendamentos
    const scheduleData = schedule.map(day => ({
      date: day.date,
      caregiverId: day.caregiverId,
      notes: 'Gerado automaticamente',
      isSpecialArrangement: false
    }));
    
    return await Schedule.bulkCreate(scheduleData);
  } catch (error) {
    console.error('Erro ao salvar calendário:', error);
    throw error;
  }
}

module.exports = {
  generateRotation,
  saveSchedule
};