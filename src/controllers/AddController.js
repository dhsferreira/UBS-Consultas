const AddHorarioModel = require('../models/AddHorarioModel');

// Função para lidar com a requisição de adicionar novos dias e horários
const adicionarDiasHorarios = async (req, res) => {
  try {
    const diasParaAdicionar = 7;  // Quantos dias no futuro adicionar
    const horariosPorDia = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:30','14:00','14:30','15:00', '15:30','16:00','16:30','17:00', '17:30',];  // Horários disponíveis por dia
    const resultado = await AddHorarioModel.adicionarDiasHorarios(diasParaAdicionar, horariosPorDia);
    res.status(200).json({ message: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Função para lidar com a remoção de dias e horários passados
const removerDiasHorariosPassados = async (req, res) => {
  try {
    const resultado = await AddHorarioModel.removerDiasHorariosPassados();
    res.status(200).json({ message: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  adicionarDiasHorarios,
  removerDiasHorariosPassados
};
