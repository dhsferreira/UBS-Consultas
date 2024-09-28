const db = require('../db');

module.exports = {
    buscarNomes: () => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT ubs_id, ubs_nome FROM Ubs',
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar os nomes das UBS.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    },

    buscarAreasPorUbsId: (ubsId) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT a.area_nome ' +
                'FROM areas_medicas a ' +
                'INNER JOIN tabela_ligacao_ubs t ON a.area_id = t.area_id ' +
                'WHERE t.ubs_id = ?',
                [ubsId],
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar as áreas da UBS.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    }
}
