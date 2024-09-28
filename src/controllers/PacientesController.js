const PacienteModel = require('../services/PacienteModel');

module.exports = {

    inserir: async (req, res) => {
        let json = { error: '', result: {} };
    
        let nome = req.body.paci_nome;
        let dataNascimento = req.body.paci_data_nascimento;
        let CPF = req.body.paci_CPF;
        let telefone = req.body.paci_cel;
        let email = req.body.paci_email;
        let endereco = req.body.paci_endereco;
        let senha = req.body.paci_senha;
    
        if (nome && dataNascimento && CPF && telefone && email && endereco && senha) {
            try {
                let paci_id = await PacienteModel.inserir(nome, dataNascimento, CPF, telefone, email, endereco, senha);
                json.result = {
                    paci_id: paci_id,
                    nome,
                    dataNascimento,
                    CPF,
                    telefone,
                    email,
                    endereco,
                    senha
                };
            } catch (error) {
                json.error = 'Erro ao inserir dados no MySQL ou Supabase';
            }
        } else {
            json.error = 'Campos não enviados';
        }
    
        res.json(json);
    },
    

alterarDadosPaciente: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        const { paci_id } = req.params;
        const dadosPaciente = req.body;

        if (!paci_id) {
            json.error = 'ID do paciente não fornecido';
            res.status(400).json(json);
            return;
        }

        // Chama a função do modelo para alterar os dados do paciente
        await PacienteModel.alterarDadosPaciente(paci_id, dadosPaciente);

        json.result = 'Dados do paciente alterados com sucesso';
        res.json(json);
    } catch (error) {
        console.error('Erro ao processar solicitação de alteração de dados do paciente:', error);
        json.error = 'Erro ao processar solicitação de alteração de dados do paciente';
        res.status(500).json(json);
    }
},

TodasConsultasDeUmPaci: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        let paci_id = req.params.paci_id;
        let data = req.query.data; // Obtém a data a partir dos parâmetros da query string

        // Chama a função do model para buscar as consultas com o paci_id e data especificados
        let consulta = await PacienteModel.TodasConsultasDeUmPaci(paci_id, data);

        // Formata a resposta para incluir os dados das consultas
        json.result = consulta;

        res.json(json);
    } catch (error) {
        // Se ocorrer um erro, envie uma resposta de erro
        json.error = 'Erro ao buscar as consultas.';
        res.status(500).json(json);
    }
},

criarConsulta: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        // Extrai os dados da requisição
        const { paci_id, ubs_id, area_nome, horarios_dia, horarios_horarios, consul_estado } = req.body;

        if (!paci_id || !ubs_id || !area_nome || !horarios_dia || !horarios_horarios) {
            json.error = 'Parâmetros obrigatórios faltando.';
            res.status(400).json(json);
            return;
        }

        // Chama as funções para buscar area_id e horarios_id
        const area_id = await PacienteModel.buscarAreaIdPorNome(area_nome);
        const horarios_id = await PacienteModel.buscarHorariosId(horarios_dia, horarios_horarios);

        if (!area_id || !horarios_id) {
            json.error = 'Erro ao buscar area_id ou horarios_id.';
            res.status(400).json(json);
            return;
        }

        // Chama a função do modelo para criar a consulta e atualizar o horários_dispo
        const consulta_id = await PacienteModel.criarConsulta(paci_id, ubs_id, area_id, horarios_id, consul_estado || 'Em espera');

        // Formata a resposta com o ID da consulta criada
        json.result = { consulta_id };
        res.json(json);

    } catch (error) {
        json.error = 'Erro ao criar a consulta.';
        res.status(500).json(json);
    }
},


listarExamesPorPaciente: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        const paci_id = req.params.paci_id; // Obtém o paci_id da URL
        const dadosPacienteExames = await PacienteModel.buscarExamesPorPaciente(paci_id);

        if (dadosPacienteExames.length > 0) {
            json.result = dadosPacienteExames; // Retorna os dados do paciente, exames e UBS
        } else {
            json.error = 'Nenhum exame encontrado para esse paciente.';
        }

        res.json(json);
    } catch (error) {
        json.error = 'Erro ao buscar os exames, dados do paciente e UBS.';
        res.status(500).json(json);
    }
},

listarReceitasPorPaciente: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        const paci_id = req.params.paci_id; // Obtém o paci_id da URL
        const dadosPacienteReceita = await PacienteModel.buscarReceitasPorPaciente(paci_id);

        if (dadosPacienteReceita.length > 0) {
            json.result = dadosPacienteReceita; // Retorna os dados do paciente, exames e UBS
        } else {
            json.error = 'Nenhum exame encontrado para esse paciente.';
        }

        res.json(json);
    } catch (error) {
        json.error = 'Erro ao buscar os exames, dados do paciente e UBS.';
        res.status(500).json(json);
    }
},

listarVacinasPorPaciente: async (req, res) => {
    let json = { error: '', result: {} };

    try {
        const paci_id = req.params.paci_id; // Obtém o paci_id da URL
        const dadosPacienteVacina = await PacienteModel.buscarVacinasPorPaciente(paci_id);

        if (dadosPacienteVacina.length > 0) {
            json.result = dadosPacienteVacina; // Retorna os dados do paciente, exames e UBS
        } else {
            json.error = 'Nenhum exame encontrado para esse paciente.';
        }

        res.json(json);
    } catch (error) {
        json.error = 'Erro ao buscar os exames, dados do paciente e UBS.';
        res.status(500).json(json);
    }
}

  
}