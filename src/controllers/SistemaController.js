const SistemaModel = require ('../services/SistemaModel')

module.exports = {
  buscarAreasPorUBS: async (req, res) => {
    let json = { error: '', result: {} };
  
    try {
      let ubs_id = req.params.ubs_id; // Obtém o ubs_id a partir dos parâmetros da requisição
  
      // Chama a função do model para buscar as áreas com o ubs_id especificado
      let areas = await SistemaModel.buscarAreasPorUBS(ubs_id);
  
      // Formata a resposta para incluir os dados das áreas
      json.result = areas;
  
      res.json(json);
    } catch (error) {
      // Se ocorrer um erro, envie uma resposta de erro
      json.error = 'Erro ao buscar as áreas.';
      res.status(500).json(json);
    }
  },

  buscarHorariosDiaPorUbsEAreaNome: async (req, res) => {
    let json = { error: '', result: [] };

    try {
        const { area_nome, ubs_id } = req.params; // Obtém o nome da área e o ID da UBS dos parâmetros da URL

        // Chama o método combinado do modelo para buscar os horários do dia
        const horariosDia = await SistemaModel.buscarHorariosDiaPorUbsEAreaNome(ubs_id, area_nome);
        json.result = horariosDia; // Armazena os horários do dia no objeto json de resposta
        res.status(200).json(json);
    } catch (error) {
        console.error('Erro no controlador ao buscar os horários do dia:', error);
        json.error = 'Erro ao buscar os horários do dia.';
        if (error.details) {
            json.details = error.details;
        }
        res.status(500).json(json);
    }
},
  
buscarHorariosPorUbsAreaEDia: async (req, res) => {
  const { ubs_id, area_nome, horarios_dia } = req.params; // Obtém os parâmetros da URL

  try {
      // Chama o método do modelo para buscar os horários
      const horarios = await SistemaModel.buscarHorariosPorUbsAreaEDia(ubs_id, area_nome, horarios_dia);
      res.status(200).json({ result: horarios });
  } catch (error) {
      console.error('Erro no controlador ao buscar os horários:', error);
      res.status(500).json({ error: 'Erro ao buscar os horários.', details: error.details });
  }
},

listarTodosUBS: async (req, res) => {
  let json = { error: '', result: [] };

  try {
      // Chama a função do modelo para buscar os nomes das UBS
      const ubs = await SistemaModel.buscarTodosUBS();
      
      // Formata a resposta com a lista de nomes das UBS
      json.result = ubs.map(row => row.ubs_nome);

      res.json(json);
  } catch (error) {
      json.error = 'Erro ao buscar os nomes das UBS.';
      res.status(500).json(json);
  }
},
obterNomeUbs: async (req, res) => {
  const ubsId = parseInt(req.params.id, 10);

  if (isNaN(ubsId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const ubsNome = await buscarUbsNomePorId(ubsId);

    if (ubsNome) {
      return res.json({ ubs_nome: ubsNome });
    } else {
      return res.status(404).json({ error: 'UBS não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar o nome da UBS:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
},

buscarNomePorId: async (req, res) => {
  let json = { error: '', result: null };
  let ubs_id = req.params.id;

  try {
      let ubs = await SistemaModel.buscarNomePorId(ubs_id);

      if (ubs) {
          json.result = ubs;
      } else {
          json.error = 'UBS não encontrada.';
      }

      res.json(json);
  } catch (error) {
      json.error = 'Erro ao buscar o nome da UBS.';
      res.status(500).json(json);
  }
}, 


};
   
