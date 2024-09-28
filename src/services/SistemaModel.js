const db = require ('../db')

module.exports = {
  buscarAreasPorUBS: (ubs_id) => {
    return new Promise((aceito, recusado) => {
      const query = `
        SELECT 
          areas_medicas.area_nome
        FROM 
          areas_medicas
        INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id
        WHERE
          tabela_ligacao_ubs.ubs_id = ?;
      `;
  
      db.query(query, [ubs_id], (error, results) => {
        if (error) {
          recusado({ error: 'Ocorreu um erro ao buscar as áreas.', details: error });
          return;
        }
  
        aceito(results);
      });
    });
  },

  buscarHorariosDiaPorUbsEAreaNome: (ubs_id, area_nome) => { 
    return new Promise((aceito, recusado) => {
        // Primeiro, buscar area_id com base no area_nome
        db.query(
            'SELECT area_id FROM areas_medicas WHERE area_nome = ?',
            [area_nome],
            (error, results) => {
                if (error) {
                    console.error('Erro ao buscar o ID da área:', error);
                    recusado({ error: 'Erro ao buscar o ID da área.', details: error });
                    return;
                }

                if (results.length === 0) {
                    console.error('Área não encontrada para o nome:', area_nome);
                    recusado({ error: 'Área não encontrada.' });
                    return;
                }

                const area_id = results[0].area_id;
                console.log('Área ID encontrado:', area_id);

                // Em seguida, buscar horarios_dia com base no ubs_id, area_id e verificar se horarios_dispo = 1
                db.query(
                    `SELECT DISTINCT datas_horarios.horarios_dia 
                     FROM datas_horarios 
                     INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id 
                     INNER JOIN areas_medicas ON horarios_areas.area_id = areas_medicas.area_id 
                     INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id 
                     WHERE tabela_ligacao_ubs.ubs_id = ? 
                     AND horarios_areas.area_id = ? 
                     AND datas_horarios.horarios_dispo = 1`, // Filtro para horários disponíveis
                    [ubs_id, area_id],
                    (error, results) => {
                        if (error) {
                            console.error('Erro ao buscar os horários do dia:', error);
                            recusado({ error: 'Erro ao buscar os horários do dia.', details: error });
                            return;
                        }

                        // Formatando a data para 'YYYY-MM-DD'
                        const formattedResults = results.map(result => ({
                            ...result,
                            horarios_dia: result.horarios_dia.toISOString().split('T')[0]
                        }));

                        aceito(formattedResults);
                    }
                );
            }
        );
    });


},

buscarHorariosPorUbsAreaEDia: (ubs_id, area_nome, horarios_dia) => {
  return new Promise((aceito, recusado) => {
      // Primeiro, buscar area_id com base no area_nome
      db.query(
          'SELECT area_id FROM areas_medicas WHERE area_nome = ?',
          [area_nome],
          (error, results) => {
              if (error) {
                  console.error('Erro ao buscar o ID da área:', error);
                  recusado({ error: 'Erro ao buscar o ID da área.', details: error });
                  return;
              }

              if (results.length === 0) {
                  console.error('Área não encontrada para o nome:', area_nome);
                  recusado({ error: 'Área não encontrada.' });
                  return;
              }

              const area_id = results[0].area_id;

              // Em seguida, buscar horario_horario com base no ubs_id, area_id, horarios_dia e verificar se horarios_dispo = 1
              db.query(
                  `SELECT horarios_horarios 
                   FROM datas_horarios 
                   INNER JOIN horarios_areas ON datas_horarios.horarios_id = horarios_areas.horarios_id 
                   INNER JOIN areas_medicas ON horarios_areas.area_id = areas_medicas.area_id 
                   INNER JOIN tabela_ligacao_ubs ON areas_medicas.area_id = tabela_ligacao_ubs.area_id 
                   WHERE tabela_ligacao_ubs.ubs_id = ? 
                   AND horarios_areas.area_id = ? 
                   AND datas_horarios.horarios_dia = ? 
                   AND datas_horarios.horarios_dispo = 1`, // Filtro para horários disponíveis
                  [ubs_id, area_id, horarios_dia],
                  (error, results) => {
                      if (error) {
                          console.error('Erro ao buscar o horário:', error);
                          recusado({ error: 'Erro ao buscar o horário.', details: error });
                          return;
                      }

                      aceito(results); // Retorna o resultado encontrado
                  }
              );
          }
      );
  });
},

buscarTodosUBS: () => {
  return new Promise((resolve, reject) => {
      const query = 'SELECT ubs_nome FROM ubs';
      db.query(query, (error, results) => {
          if (error) {
              reject({ error: 'Erro ao buscar os nomes das UBS.', details: error });
              return;
          }
          resolve(results); // Retorna todos os nomes das UBS
      });
  });
},
buscarNomePorId: (ubs_id) => {
    return new Promise((aceito, recusado) => {
        db.query(
            'SELECT ubs_nome FROM ubs WHERE ubs_id = ?',
            [ubs_id],
            (error, results) => {
                if (error) {
                    recusado({ error: 'Erro ao buscar o nome da UBS.', details: error });
                    return;
                }
                if (results.length > 0) {
                    aceito(results[0]); // Retorna o primeiro (e único) resultado
                } else {
                    aceito(null); // Retorna null se não houver resultado
                }
            }
        );
    });
},



};
