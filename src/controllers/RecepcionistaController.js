const RecepcionistaModel = require('../services/RecepcionistaModel');

module.exports = {

    inserirRecep: async (req, res) => {
        let json = { error: '', result: {} };

        let nome = req.body.recep_nome;
        let CPF = req.body.recep_CPF;
        let telefone = req.body.recep_cel;
        let email = req.body.recep_email;
        let senha = req.body.recep_senha;
        let ubs_id = req.body.ubs_id; // Adicionando o campo ubs_id

        if (nome && CPF && telefone && email && senha && ubs_id) {
            try {
                let recep_id = await RecepcionistaModel.inserirRecep(nome, CPF, telefone, email, senha, ubs_id);
                json.result = {
                    recep_id: recep_id,
                    nome,
                    CPF,
                    telefone,
                    email,
                    senha,
                    ubs_id
                };
            } catch (error) {
                json.error = 'Erro ao inserir dados no MySQL ou Supabase';
            }
        } else {
            json.error = 'Campos não enviados';
        }

        res.json(json);
},



    alterarDadosRecepcionista: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            const { recep_id } = req.params;
            const dadosRecepcionista = req.body;
   
            if (!recep_id) {
                json.error = 'ID da recepcionista não fornecido';
                res.status(400).json(json);
                return;
            }
   
            // Chama a função do modelo para alterar os dados da recepcionista
            await RecepcionistaModel.alterarDadosRecepcionista(recep_id, dadosRecepcionista);
   
            json.result = 'Dados da recepcionista alterados com sucesso';
            res.json(json);
        } catch (error) {
            console.error('Erro ao processar solicitação de alteração de dados da recepcionista:', error);
            json.error = 'Erro ao processar solicitação de alteração de dados da recepcionista';
            res.status(500).json(json);
        }
    },
   

    TodasConsultasDeUmaUbs: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            let ubs_id = req.params.ubs_id;
            let data = req.query.data; // Obtém a data a partir dos parâmetros da query string
   
            // Chama a função do model para buscar as consultas com o ubs_id e data especificados
            let consulta = await RecepcionistaModel.TodasConsultasDeUmaUbs(ubs_id, data);
   
            // Formata a resposta para incluir os dados das consultas
            json.result = consulta;
   
            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envie uma resposta de erro
            json.error = 'Erro ao buscar as consultas.';
            res.status(500).json(json);
        }
    },

    TodasConsultasDeUmaUbsPorDia: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            let ubs_id = req.params.ubs_id;  // Obtém o ubs_id dos parâmetros da rota
            let horarios_dia = req.params.horarios_dia;  // Obtém o horarios_dia dos parâmetros da rota
   
            // Chama a função do model para buscar as consultas com o ubs_id e horarios_dia especificados
            let consulta = await RecepcionistaModel.TodasConsultasDeUmaUbsPorDia(ubs_id, horarios_dia);
   
            // Formata a resposta para incluir os dados das consultas
            json.result = consulta;
   
            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envie uma resposta de erro
            json.error = 'Erro ao buscar as consultas.';
            res.status(500).json(json);
        }
    },

    TodasConsultasDeUbsArea: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            let ubs_id = req.params.ubs_id;
            let area_nome = req.params.area_nome; // Obtém o nome da área
            let data = req.query.data; // Obtém a data a partir dos parâmetros da query string
   
            // Chama a função do model para buscar as consultas com o ubs_id, area_nome e data especificados
            let consultas = await RecepcionistaModel.TodasConsultasDeUbsArea(ubs_id, area_nome, data);
   
            // Formata a resposta para incluir os dados das consultas
            json.result = consultas;
   
            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envie uma resposta de erro
            json.error = 'Erro ao buscar as consultas.';
            res.status(500).json(json);
        }
    },
   
    TodasConsultasDeUbsAreaDia: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            let ubs_id = req.params.ubs_id;
            let area_nome = req.params.area_nome; // Obtém o nome da área
            let dia = req.params.dia; // Obtém o dia a partir dos parâmetros da URL
   
            // Chama a função do modelo para buscar as consultas com o ubs_id, area_nome e dia especificados
            let consultas = await RecepcionistaModel.TodasConsultasDeUbsAreaDia(ubs_id, area_nome, dia);
   
            // Formata a resposta para incluir os dados das consultas
            json.result = consultas;
   
            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envie uma resposta de erro
            json.error = 'Erro ao buscar as consultas.';
            res.status(500).json(json);
        }
    },
   

    alterarEstadoConsulta: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            const { consul_id } = req.params;
            const { consul_estado } = req.body;
   
            // Valida se consul_id e consul_estado foram fornecidos corretamente
            if (!consul_id || !consul_estado) {
                json.error = 'ID da consulta ou novo estado não fornecido';
                res.status(400).json(json);
                return;
            }
   
            // Verifica se o consul_estado é uma string válida
            if (typeof consul_estado !== 'string') {
                json.error = 'O estado da consulta deve ser uma string.';
                res.status(400).json(json);
                return;
            }
   
            // Chama a função do modelo para alterar o estado da consulta
            let resultado = await RecepcionistaModel.alterarEstadoConsulta(consul_id, consul_estado);
   
            // Verifica se a consulta foi encontrada e alterada
            if (resultado.affectedRows > 0) {
                json.result = 'Estado da consulta alterado com sucesso';
            } else {
                json.error = 'Consulta não encontrada ou estado já definido';
            }
   
            res.json(json);
        } catch (error) {
            console.error('Erro ao processar solicitação de alteração de estado da consulta:', error);
            json.error = 'Erro ao processar solicitação de alteração de estado da consulta';
            res.status(500).json(json);
        }
    },

    adicionarHorarioAreaMedica: async (req, res) => {
  let json = { error: '', result: {} };

  try {
      // Extrai os dados da requisição
      const { area_nome, horarios_dia, horarios_horarios } = req.body;

      // Validação dos parâmetros
      if (!area_nome || !horarios_dia || !horarios_horarios) {
          json.error = 'Parâmetros obrigatórios faltando: ';
          if (!area_nome) json.error += 'area_nome ';
          if (!horarios_dia) json.error += 'horarios_dia ';
          if (!horarios_horarios) json.error += 'horarios_horarios ';
          res.status(400).json(json);
          return;
      }

      // Chama a função do modelo para adicionar o horário à área médica
      const resultado = await RecepcionistaModel.adicionarHorarioAreaMedica(area_nome, horarios_dia, horarios_horarios);

      // Verifica se a operação foi bem-sucedida e retorna o resultado
      if (!resultado) {
          json.error = 'Erro ao adicionar horário à área médica.';
          res.status(500).json(json);
          return;
      }

      // Retorna sucesso
      json.result = resultado;
      res.status(200).json(json);
  } catch (error) {
      json.error = 'Erro ao adicionar o horário.';
      if (error.details) {
          json.details = error.details;
      }
      res.status(500).json(json);
  }
},

  buscarHorariosNaoVinculados: async (req, res) => {
    let json = { error: '', result: [] };

    try {
        // Extrai o dia dos parâmetros da URL
        const { horarios_dia } = req.params;

        // Verifica se o parâmetro foi fornecido
        if (!horarios_dia) {
            json.error = 'Parâmetro obrigatório faltando: horarios_dia.';
            res.status(400).json(json);
            return;
        }

        console.log('Dia recebido no controller:', horarios_dia);  // Adiciona log aqui para verificar o valor

        // Chama a função do modelo para buscar os horários não vinculados
        const horariosNaoVinculados = await RecepcionistaModel.buscarHorariosNaoVinculados(horarios_dia);

        // Retorna o resultado
        json.result = horariosNaoVinculados;
        res.status(200).json(json);
    } catch (error) {
        json.error = 'Erro ao buscar os horários não vinculados.';
        if (error.details) {
            json.details = error.details;
        }
        res.status(500).json(json);
    }
},


    buscarDiasNaoVinculados: async (req, res) => {
    let json = { error: '', result: [] };

    try {
        // Chama a função do modelo para buscar os dias não vinculados
        const diasNaoVinculados = await RecepcionistaModel.buscarDiasNaoVinculados();

        // Retorna o resultado
        json.result = diasNaoVinculados;
        res.status(200).json(json);
    } catch (error) {
        json.error = 'Erro ao buscar os dias não vinculados.';
        if (error.details) {
            json.details = error.details;
        }
        res.status(500).json(json);
    }
},

TodasRecepDeUmaUbs: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        // Obtém o ubs_id da URL (parâmetro de rota)
        let ubs_id = req.params.ubs_id;

        // Valida se o ubs_id foi fornecido
        if (!ubs_id) {
            json.error = 'ID da UBS não fornecido';
            return res.status(400).json(json);
        }

        // Chama a função do modelo para buscar os recepcionistas associados à UBS
        let recepcionistas = await RecepcionistaModel.TodasRecepDeUmaUbs(ubs_id);

        // Formata a resposta para incluir os dados dos recepcionistas
        json.result = recepcionistas;

        // Retorna os dados
        res.json(json);
    } catch (error) {
        // Se ocorrer um erro, envia uma resposta de erro
        json.error = 'Erro ao buscar os recepcionistas da UBS';
        res.status(500).json(json);
    }
},   
   
   
   



   
   
    /////////////////////////////////////////////////////////
    inserir: async (req, res) => {
        let json = { error: '', result: {} };

        let nome = req.body.recep_nome;
        let CPF = req.body.recep_CPF;
        let telefone = req.body.recep_cel;
        let email = req.body.recep_email;
        let senha = req.body.recep_senha;
        let ubs = req.body.ubs_id;

        // Verificar se todos os campos foram enviados
        if (nome && CPF && telefone && email && senha && ubs) {
            try {
                // Inserir no banco de dados
                let recep_id = await RecepcionistaModel.inserir(nome, CPF, telefone, email, senha, ubs);

                // Retornar o resultado
                json.result = {
                    recep_id,
                    nome,
                    CPF,
                    telefone,
                    email,
                    senha,
                    ubs
                };
            } catch (error) {
                console.error('Erro ao inserir dados no MySQL ou Supabase:', error);
                json.error = 'Erro ao inserir dados no MySQL ou Supabase';
            }
        } else {
            json.error = 'Campos não enviados';
        }

        res.json(json);
    },
    buscarTodos: async (req, res)=>{                  // -------------------------LISTAR TODOS--------------------------------- //
        let json ={error:'', result:[]};

        let recepcionista = await RecepcionistaModel.buscarTodos();  

        for(let i in recepcionista){
            json.result.push({
                recep_nome: recepcionista[i].recep_nome,
                recep_CPF: recepcionista[i].recep_CPF,
                recep_cel: recepcionista[i].recep_cel,
                recep_email: recepcionista[i].recep_email,
                recep_senha: recepcionista[i].recep_senha,
            });
        }
        res.json(json);
    },

   
   

    login: async (req, res) => {
        let json = { error: '', message: '' };
   
        try {
            const { recep_CPF, recep_senha } = req.body;
   
            console.log('CPF fornecido:', recep_CPF);
            console.log('Senha fornecida:', recep_senha);
   
            // Verifica o login do Recepcionista no modelo
            const recep = await RecepcionistaModel.verificarLogin(recep_CPF, recep_senha);
   
            if (recep) {
                json.message = `Login bem-sucedido!`;
            } else {
                json.error = 'CPF ou senha inválidos.';
            }
   
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao processar a solicitação de login.';
            res.status(500).json(json);
        }
    },
   
    // Adicione esta função ao seu controlador de consulta
/*alterarEstadoConsulta: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        const { consul_id } = req.params;
        const { consul_estado } = req.body;

        if (!consul_id || consul_estado === undefined) {
            json.error = 'ID da consulta ou novo estado não fornecido';
            res.status(400).json(json);
            return;
        }

        // Chama a função do modelo para alterar o estado da consulta
        await RecepcionistaModel.alterarEstadoConsulta(consul_id, consul_estado);

        json.result = 'Estado da consulta alterado com sucesso';
        res.json(json);
    } catch (error) {
        console.error('Erro ao processar solicitação de alteração de estado da consulta:', error);
        json.error = 'Erro ao processar solicitação de alteração de estado da consulta';
        res.status(500).json(json);
    }
},*/

adicionarHorarioEArea: async (req, res) => {
    try {
        const { horarios_dia, horarios_horarios } = req.body;
        const area_id = req.params.area_id;

        // Adicionar horário e vincular à área
        const { horarios_id } = await RecepcionistaModel.adicionarHorarioEArea(horarios_dia, horarios_horarios, area_id);

        res.json({ message: 'Horário adicionado com sucesso à área.', horarios_id, area_id });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar horário à área.', details: error });
    }
},



   
}