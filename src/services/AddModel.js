const connection = require('../config/db');

// Função para adicionar novos dias e horários
const adicionarDiasHorarios = (diasParaAdicionar, horariosPorDia) => {
  return new Promise((resolve, reject) => {
    for (let dia = 1; dia <= diasParaAdicionar; dia++) {
      const novaData = new Date();
      novaData.setDate(novaData.getDate() + dia);
      const novaDataFormatada = novaData.toISOString().split('T')[0];

      horariosPorDia.forEach(horario => {
        const query = 'INSERT INTO datas_horarios (horarios_dia, horarios_horarios) VALUES (?, ?)';
        connection.query(query, [novaDataFormatada, horario], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
        });
      });
    }
    resolve('Dias e horários adicionados com sucesso');
  });
};

// Função para remover dias e horários passados
const removerDiasHorariosPassados = () => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM datas_horarios
      WHERE horarios_dia < CURDATE() OR (horarios_dia = CURDATE() AND horarios_horarios < CURTIME())
    `;
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(`Dias e horários passados removidos: ${results.affectedRows}`);
    });
  });
};

module.exports = {
  adicionarDiasHorarios,
  removerDiasHorariosPassados
};
