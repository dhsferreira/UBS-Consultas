const UbsModel = require('../services/UbsModel');

module.exports = {
    buscarNomes: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let ubsNomes = await UbsModel.buscarNomes();

            for (let i = 0; i < ubsNomes.length; i++) {
                let ubs = ubsNomes[i];
                json.result.push({
                    ubs_id: ubs.ubs_id,
                    ubs_nome: ubs.ubs_nome
                });
            }

            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar os nomes das UBS.';
            res.status(500).json(json);
        }
    },

    buscarAreasPorUbsId: async (req, res) => {
        let json = { error: '', result: [] };
        let ubsId = req.params.id;

        try {
            let areas = await UbsModel.buscarAreasPorUbsId(ubsId);

            for (let i = 0; i < areas.length; i++) {
                let area = areas[i];
                json.result.push({
                    area_nome: area.area_nome
                });
            }

            res.json(json);
        } catch (error) {
            json.error = 'Erro ao buscar as áreas da UBS.';
            res.status(500).json(json);
        }
    }
}
