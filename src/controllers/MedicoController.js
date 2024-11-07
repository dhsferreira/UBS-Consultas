const MedicoModel = require('../services/MedicoModel');
const consultaModel = require('../services/MedicoModel');

module.exports = {

    alterarDadosMedico: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            const { medi_id } = req.params;
            const dadosMedico = req.body;
   
            if (!medi_id) {
                json.error = 'ID do médico não fornecido';
                res.status(400).json(json);
                return;
            }
   
            // Chama a função do modelo para alterar os dados do médico
            await MedicoModel.alterarDadosMedico(medi_id, dadosMedico);
   
            json.result = 'Dados do médico alterados com sucesso';
            res.json(json);
        } catch (error) {
            console.error('Erro ao processar solicitação de alteração de dados do médico:', error);
            json.error = 'Erro ao processar solicitação de alteração de dados do médico';
            res.status(500).json(json);
        }
    },
   

    adicionarReceita: async (req, res) => {
        const json = { error: '', result: {} };
        const {
            ubs_id, medi_id, paci_id, medicamento_nome, dosagem,
            frequencia_dosagem, tempo_uso, observacao_medica,
            data_emissao, data_validade
        } = req.body;

        if (!ubs_id || !medi_id || !paci_id || !medicamento_nome || !dosagem || !frequencia_dosagem || !tempo_uso || !data_emissao || !data_validade) {
            json.error = 'Parâmetros obrigatórios faltando.';
            res.status(400).json(json);
            return;
        }

        try {
            const receitaId = await MedicoModel.adicionarReceita(
                ubs_id, medi_id, paci_id, medicamento_nome, dosagem,
                frequencia_dosagem, tempo_uso, observacao_medica,
                data_emissao, data_validade
            );

            json.result = { receita_id: receitaId };
            res.status(201).json(json); // Retorna o ID da receita criada
        } catch (error) {
            json.error = 'Erro ao adicionar receita.';
            res.status(500).json(json);
        }
    },

    criarExame: async (req, res) => {
        let json = { error: '', result: {} };
   
        try {
            // Extrai os dados da requisição
            const { exame_descricao, exame_dia, exame_hora, ubs_id } = req.body;
   
            if (!exame_descricao || !exame_dia || !exame_hora || !ubs_id) {
                json.error = 'Parâmetros obrigatórios faltando.';
                res.status(400).json(json);
                return;
            }
   
            // Chama a função do modelo para criar o exame
            const exame_id = await MedicoModel.criarExame(exame_descricao, exame_dia, exame_hora, ubs_id);
   
            // Formata a resposta com o ID do exame criado
            json.result = { exame_id };
            res.json(json);
   
        } catch (error) {
            json.error = 'Erro ao criar o exame.';
            res.status(500).json(json);
        }
    },




    ////////////////////////////////////////////////////////////////////////
    umaconsul: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            let paci_id = req.params.paci_id;
            let data = req.query.data; // Obtém a data a partir dos parâmetros da query string

            // Chama a função do model para buscar as consultas com o paci_id e data especificados
            let consulta = await consultaModel.umaconsul(paci_id, data);

            // Formata a resposta para incluir os dados das consultas
            json.result = consulta;

            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envie uma resposta de erro
            json.error = 'Erro ao buscar as consultas.';
            res.status(500).json(json);
        }
    },



///////////////////////////////////////////////////////////////////
    criarConsulta: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            // Extrai os dados da requisição
            const { paci_id, ubs_id, area_id, horarios_id, consul_estado } = req.body;

            // Chama a função do modelo para criar a consulta
            const consulta_id = await consultaModel.criarConsulta(paci_id, ubs_id, area_id, horarios_id, consul_estado);

            // Formata a resposta com o ID da consulta criada
            json.result = { consulta_id };

            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envia uma resposta de erro
            json.error = 'Erro ao criar a consulta.';
            res.status(500).json(json);
        }
    },
///////////////////////////////////////////////////////////////////
    buscarConsultasPorData: async (req, res) => {
        let json = { error: '', result: [] };
     
        try {
            let dia = req.params.dia;
     
            let consultasPorDia = await consultaModel.buscarConsultasPorData(dia);
     
            json.result = consultasPorDia;
     
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar as consultas por dia.';
            res.status(500).json(json);
        }
      },
      criarConsulta: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let { ubs_id, paci_id, area_nome, horarios_dia, horarios_horarios } = req.body;

            let resultado = await HorarioModel.criarConsulta(ubs_id, paci_id, area_nome, horarios_dia, horarios_horarios);
            json.result = resultado;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao criar a consulta.';
            if (error.details) {
                json.details = error.details;
            }
            res.status(500).json(json);
        }
    },
    /*////////////////////////////////*/
    criarConsulta: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            // Extrai os dados da requisição
            const { paci_id, ubs_id, area_nome, horarios_dia, horarios_horarios, consul_estado } = req.body;

            // Chama a função do modelo para criar a consulta
            const consulta_id = await consultaModel.criarConsulta(paci_id, ubs_id, area_nome, horarios_dia, horarios_horarios, consul_estado);

            // Formata a resposta com o ID da consulta criada
            json.result = { consulta_id };

            res.json(json);
        } catch (error) {
            // Se ocorrer um erro, envia uma resposta de erro
            json.error = 'Erro ao criar a consulta.';
            if (error.details) {
                json.details = error.details;
            }
            res.status(500).json(json);
        }
    },
 
     
}
