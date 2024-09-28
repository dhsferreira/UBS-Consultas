const db = require('../db');

module.exports = {
    buscarUm: (area_id) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT datas_horarios.horarios_dia, datas_horarios.horarios_horarios, datas_horarios.horarios_dispo ' +
                'FROM datas_horarios ' +
                'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                'WHERE horarios_areas.area_id = ?',
                [area_id],
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar os horários.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    },

    buscarHorariosdoDia: (area_id) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT DATE(horarios_dia) AS dia, GROUP_CONCAT(horarios_horarios ORDER BY horarios_horarios ASC) AS horarios, GROUP_CONCAT(horarios_dispo ORDER BY horarios_horarios ASC) AS horarios_dispo ' +
                'FROM datas_horarios ' +
                'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                'WHERE horarios_areas.area_id = ? ' +
                'GROUP BY dia',
                [area_id],
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar os horários.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    },

    buscarHorariosPorDia: (area_id, dia) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT horarios_horarios, horarios_dispo ' +
                'FROM datas_horarios ' +
                'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                'WHERE horarios_areas.area_id = ? AND DATE(datas_horarios.horarios_dia) = ?',
                [area_id, dia],
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar os horários.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    },
    
    buscarHorariosPorAreaEUbs: (area_id, ubs_id) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT datas_horarios.horarios_dia, datas_horarios.horarios_horarios, datas_horarios.horarios_dispo ' +
                'FROM datas_horarios ' +
                'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                'INNER JOIN areas_medicas ON horarios_areas.area_id = areas_medicas.area_id ' +
                'INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id ' +
                'WHERE horarios_areas.area_id = ? AND tabela_ligacao_ubs.ubs_id = ?',
                [area_id, ubs_id],
                (error, results) => {
                    if (error) {
                        recusado({ error: 'Erro ao buscar os horários.', details: error });
                        return;
                    }
                    aceito(results);
                }
            );
        });
    },
    buscarAreaIdPorNome: (area_nome) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'SELECT area_id FROM areas_medicas WHERE area_nome = ?',
                [area_nome],
                (error, results) => {
                    if (error) {
                        console.error('Erro ao buscar o ID da área:', error);
                        recusado({ error: 'Erro ao buscar o ID da área.', details: error });
                        return;
                    }
                    if (results.length > 0) {
                        aceito(results[0].area_id);
                    } else {
                        console.error('Área não encontrada para o nome:', area_nome);
                        recusado({ error: 'Área não encontrada.' });
                    }
                }
            );
        });
    },

    buscarHorariosDiaPorUbsEAreaNome: (ubs_id, area_nome) => {
        return new Promise(async (aceito, recusado) => {
            try {
                // Buscar area_id com base no area_nome
                let area_id = await module.exports.buscarAreaIdPorNome(area_nome);
                console.log('Área ID encontrado:', area_id);

                // Buscar horarios_dia com base no ubs_id e area_id
                db.query(
                    'SELECT DISTINCT datas_horarios.horarios_dia ' +
                    'FROM datas_horarios ' +
                    'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                    'INNER JOIN areas_medicas ON horarios_areas.area_id = areas_medicas.area_id ' +
                    'INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id ' +
                    'WHERE tabela_ligacao_ubs.ubs_id = ? AND horarios_areas.area_id = ?',
                    [ubs_id, area_id],
                    (error, results) => {
                        if (error) {
                            console.error('Erro ao buscar os horários do dia:', error);
                            recusado({ error: 'Erro ao buscar os horários do dia.', details: error });
                            return;
                        }

                        // Formatando a data
                        const formattedResults = results.map(result => ({
                            ...result,
                            horarios_dia: result.horarios_dia.toISOString().split('T')[0]
                        }));

                        aceito(formattedResults);
                    }
                );
            } catch (error) {
                console.error('Erro ao buscar os horários do dia:', error);
                recusado({ error: 'Erro ao buscar os horários do dia.', details: error });
            }
        });
    },
    buscarHorariosPorUbsAreaEDia: (ubs_id, area_nome, horarios_dia) => {
        return new Promise(async (aceito, recusado) => {
            try {
                // Buscar area_id com base no area_nome
                let area_id = await module.exports.buscarAreaIdPorNome(area_nome);
                console.log('Área ID encontrado:', area_id);
    
                // Buscar horarios_horarios com base no ubs_id, area_id, horarios_dia e horarios_dispo = 1
                db.query(
                    'SELECT datas_horarios.horarios_horarios, datas_horarios.horarios_dispo ' +
                    'FROM datas_horarios ' +
                    'INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id ' +
                    'INNER JOIN areas_medicas ON horarios_areas.area_id = areas_medicas.area_id ' +
                    'INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id ' +
                    'WHERE tabela_ligacao_ubs.ubs_id = ? AND horarios_areas.area_id = ? AND datas_horarios.horarios_dia = ? AND datas_horarios.horarios_dispo = 1',
                    [ubs_id, area_id, horarios_dia],
                    (error, results) => {
                        if (error) {
                            console.error('Erro ao buscar os horários:', error);
                            recusado({ error: 'Erro ao buscar os horários.', details: error });
                            return;
                        }
                        aceito(results);
                    }
                );
            } catch (error) {
                console.error('Erro ao buscar os horários:', error);
                recusado({ error: 'Erro ao buscar os horários.', details: error });
            }
        });
    }
    
};
