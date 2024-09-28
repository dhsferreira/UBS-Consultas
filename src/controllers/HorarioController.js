const HorarioModel = require('../services/HorarioModel');

module.exports = {
    buscarUm: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let area_id = req.params.area_id;
            let horarios = await HorarioModel.buscarUm(area_id);
            json.result = horarios;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários.';
            res.status(500).json(json);
        }
    },

    buscarHorariosdoDia: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let area_id = req.params.area_id;
            let horariosPorDia = await HorarioModel.buscarHorariosdoDia(area_id);
            json.result = horariosPorDia;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários por dia.';
            res.status(500).json(json);
        }
    },

    buscarHorariosPorDia: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let area_id = req.params.area_id;
            let dia = req.params.dia;
            let horariosPorDia = await HorarioModel.buscarHorariosPorDia(area_id, dia);
            json.result = horariosPorDia;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários por dia.';
            res.status(500).json(json);
        }
    },
    
    buscarHorariosPorAreaEUbs: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let area_id = req.params.area_id;
            let ubs_id = req.params.ubs_id;

            let horarios = await HorarioModel.buscarHorariosPorAreaEUbs(area_id, ubs_id);
            json.result = horarios;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários.';
            res.status(500).json(json);
        }
    },
    buscarHorariosDiaPorUbsEAreaNome: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let area_nome = req.params.area_nome;
            let ubs_id = req.params.ubs_id;

            // Buscar horarios_dia com base no ubs_id e area_nome
            let horariosDia = await HorarioModel.buscarHorariosDiaPorUbsEAreaNome(ubs_id, area_nome);
            json.result = horariosDia;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários do dia.';
            if (error.details) {
                json.details = error.details;
            }
            res.status(500).json(json);
        }
    },
    buscarHorariosPorUbsAreaEDia: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let ubs_id = req.params.ubs_id;
            let area_nome = req.params.area_nome;
            let horarios_dia = req.params.horarios_dia;

            let horarios = await HorarioModel.buscarHorariosPorUbsAreaEDia(ubs_id, area_nome, horarios_dia);
            json.result = horarios;
            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os horários.';
            res.status(500).json(json);
        }
    }
};
