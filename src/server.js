require('dotenv').config({ path: 'variaveis.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Certifique-se de que o arquivo `routes/index.js` está configurado corretamente
const cron = require('node-cron');
const HorarioModel = require('./services/HorarioModel'); // Corrija o caminho se necessário

const server = express();
server.use(cors());
server.use(bodyParser.json()); // Suporte para requisições JSON
server.use(bodyParser.urlencoded({ extended: false }));

server.use('/api', routes);

// Agendar tarefa para adicionar horários a cada 5 dias
cron.schedule('0 0 */5 * *', async () => {  // A cada 5 dias, à meia-noite
  try {
    const diasParaAdicionar = 5;  // Quantos dias no futuro adicionar
    const horariosPorDia = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
      '15:30', '16:00', '16:30', '17:00', '17:30'
    ];  // Horários disponíveis por dia
    await HorarioModel.adicionarDiasHorarios(diasParaAdicionar, horariosPorDia);
    console.log('Horários adicionados automaticamente a cada 5 dias.');
  } catch (err) {
    console.error('Erro ao adicionar horários automaticamente:', err);
  }
});

// Agendar tarefa para remover horários passados a cada 1 minuto
cron.schedule('* * * * *', async () => {
  try {
    await HorarioModel.removerDiasHorariosPassados();
  //  console.log('Horários passados removidos automaticamente a cada 1 minuto.');
  } catch (err) {
    console.error('Erro ao remover horários passados automaticamente:', err);
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${process.env.PORT}`);
});
