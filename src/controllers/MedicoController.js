const MedicoModel = require('../services/MedicoModel');
const consultaModel = require('../services/MedicoModel');

module.exports = {

    inserirMed: async (req, res) => {
        let json = { error: '', result: {} };
    
        let medi_nome = req.body.medi_nome;
        let medi_CPF = req.body.medi_CPF;
        let medi_cel = req.body.medi_cel;
        let medi_email = req.body.medi_email;
        let medi_senha = req.body.medi_senha;
        let medi_especializa = req.body.medi_especializa;
        let medi_CRM = req.body.medi_CRM;
        let medi_area = req.body.medi_area;
        let ubs_id = req.body.ubs_id;
    
        // Validação dos campos obrigatórios
        if (medi_nome && medi_CPF && medi_cel && medi_email && medi_senha && medi_especializa && medi_CRM && medi_area && ubs_id) {
            try {
                // Chama o método de inserção para o médico
                let medi_id = await MedicoModel.inserirMed(medi_nome, medi_CPF, medi_cel, medi_email, medi_senha, medi_especializa, medi_CRM, medi_area, ubs_id);
                
                // Se a inserção for bem-sucedida, retorna os dados
                json.result = {
                    medi_id: medi_id,
                    medi_nome,
                    medi_CPF,
                    medi_cel,
                    medi_email,
                    medi_senha,
                    medi_especializa,
                    medi_CRM,
                    medi_area,
                    ubs_id
                };
    
            } catch (error) {
                // Caso ocorra erro, retorna a mensagem de erro
                json.error = 'Erro ao inserir dados no MySQL ou Supabase';
                console.error(error);
            }
        } else {
            // Caso algum campo obrigatório não tenha sido enviado
            json.error = 'Campos não enviados';
        }
    
        // Envia a resposta em formato JSON
        res.json(json);
    },
    

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

TodosMediDeUmaUbs: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        // Obtém o ubs_id da URL (parâmetro de rota)
        let ubs_id = req.params.ubs_id;

        // Valida se o ubs_id foi fornecido
        if (!ubs_id) {
            json.error = 'ID da UBS não fornecido';
            return res.status(400).json(json);
        }

        // Chama a função do modelo para buscar os médicos associados à UBS
        let medicos = await MedicoModel.TodosMediDeUmaUbs(ubs_id);

        // Formata a resposta para incluir os dados dos médicos
        json.result = medicos;

        // Retorna os dados
        res.json(json);
    } catch (error) {
        // Se ocorrer um erro, envia uma resposta de erro
        json.error = 'Erro ao buscar os médicos da UBS';
        res.status(500).json(json);
    }
},

TodosMediDeUmaArea: async (req, res) => {
    let json = { error: '', result: [] };

    try {
        const { area_nome } = req.params; // Obtém o nome da área dos parâmetros da URL

        // Chama a função do model para buscar os médicos pela área
        const medicos = await MedicoModel.TodosMediDeUmaArea(area_nome);

        // Verifica se algum médico foi encontrado
        if (medicos.length === 0) {
            json.error = 'Nenhum médico encontrado para a área especificada.';
            return res.status(404).json(json); // Se não encontrar médicos, retorna status 404
        }

        json.result = medicos; // Armazena os médicos encontrados no objeto json de resposta
        return res.status(200).json(json); // Se encontrou médicos, retorna a lista com status 200

    } catch (error) {
        console.error('Erro ao buscar médicos pela área:', error);
        json.error = 'Erro ao buscar médicos pela área.';
        if (error.details) {
            json.details = error.details;
        }
        return res.status(500).json(json); // Em caso de erro, retorna status 500
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
