const db = require('../db');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase diretamente no model
const supabaseUrl = 'https://mvxazgyzgiuivzngdbov.supabase.co'; // Substitua pela URL do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGF6Z3l6Z2l1aXZ6bmdkYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5ODcyMjMsImV4cCI6MjA0MzU2MzIyM30.Qg05UnatADTemLtofxUeI-b7CQqt3gb8bVNmuO7q5n0'; // Substitua pela sua chave de API
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
    inserir: (paci_nome, paci_data_nascimento, paci_CPF, paci_cel, paci_email, paci_endereco, paci_senha) => {
        return new Promise((aceito, recusado) => {
            // Primeiro, insere no MySQL
            db.query(
                'INSERT INTO paciente (paci_nome, paci_data_nascimento, paci_CPF, paci_cel, paci_email, paci_endereco, paci_senha) VALUES (?,?,?,?,?,?,?)',
                [paci_nome, paci_data_nascimento, paci_CPF, paci_cel, paci_email, paci_endereco, paci_senha],
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao inserir no MySQL:', error);
                        recusado(error);
                        return;
                    }

                    const paci_id = results.insertId;

                    try {
                        // Agora insere no Supabase
                        const { data, error: supabaseError } = await supabase
                            .from('paciente')
                            .insert([
                                {
                                    paci_id: paci_id, // Usando o paci_id gerado no MySQL
                                    paci_nome: paci_nome,
                                    paci_data_nascimento: paci_data_nascimento,
                                    paci_cpf: paci_CPF,
                                    paci_cel: paci_cel,
                                    paci_email: paci_email,
                                    paci_endereco: paci_endereco,
                                    paci_senha: paci_senha
                                }
                            ]);

                        if (supabaseError) {
                            console.error('Erro ao inserir no Supabase:', supabaseError);
                            recusado(supabaseError); // Caso haja erro no Supabase
                            return;
                        }

                        console.log('Inserção no Supabase bem-sucedida:', data);
                        aceito(paci_id); // Retorna o ID do paciente que foi inserido
                    } catch (err) {
                        console.error('Erro durante a inserção no Supabase:', err);
                        recusado(err);
                    }
                }
            );
        });
    },


    alterarDadosPaciente: (paci_id, dados) => {
        return new Promise((aceito, recusado) => {
            const fieldsToUpdate = [];
            const valuesToUpdate = [];
   
            Object.keys(dados).forEach(key => {
                if (dados[key] !== undefined) {
                    fieldsToUpdate.push(`${key} = ?`);
                    valuesToUpdate.push(dados[key]);
                }
            });
   
            valuesToUpdate.push(paci_id);
   
            // Atualizando no MySQL
            db.query(
                `UPDATE paciente SET ${fieldsToUpdate.join(', ')} WHERE paci_id = ?`,
                valuesToUpdate,
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao executar consulta de alteração de dados do paciente no MySQL:', error);
                        recusado(error);
                        return;
                    }
   
                    console.log('Dados do paciente alterados no MySQL com sucesso:', results);
   
                    // Atualizando também no Supabase
                    const { data, error: supabaseError } = await supabase
                        .from('paciente')
                        .update(dados)
                        .eq('paci_id', paci_id);
   
                    if (supabaseError) {
                        console.error('Erro ao atualizar dados do paciente no Supabase:', supabaseError);
                        recusado(supabaseError);
                        return;
                    }
   
                    console.log('Dados do paciente alterados no Supabase com sucesso:', data);
                    aceito(results);
                }
            );
        });
    },
   

TodasConsultasDeUmPaci: async (paci_id, data) => {
    try {
        if (!paci_id) {
            throw new Error('paci_id não fornecido.');
        }

        let query = `
            SELECT
                paciente.paci_nome,
                paciente.paci_CPF,
                ubs.ubs_nome,
                areas_medicas.area_nome,
                DATE_FORMAT(datas_horarios.horarios_dia, '%d/%m/%Y') AS horarios_dia,
                DATE_FORMAT(datas_horarios.horarios_horarios, '%H:%i') AS horarios_horarios,
                consulta.consul_estado
            FROM
                consulta
            INNER JOIN paciente ON consulta.paci_id = paciente.paci_id
            INNER JOIN ubs ON consulta.ubs_id = ubs.ubs_id
            INNER JOIN areas_medicas ON consulta.area_id = areas_medicas.area_id
            INNER JOIN datas_horarios ON consulta.horarios_id = datas_horarios.horarios_id
            WHERE
                consulta.paci_id = ?
        `;

        const params = [paci_id];
        if (data) {
            query += ` AND DATE(datas_horarios.horarios_dia) = ?`;
            params.push(data);
        }

        // Ordena as consultas pela data e hora mais próximas
        query += ` ORDER BY datas_horarios.horarios_dia ASC, datas_horarios.horarios_horarios ASC`;

        // Usando promise() para garantir que a consulta retorna uma Promise
        const [results] = await db.promise().query(query, params);

        if (!results || results.length === 0) {
            throw new Error('Nenhuma consulta encontrada para o paciente.');
        }

        const consultas = results.map(consulta => ({
            paci_nome: consulta.paci_nome,
            paci_CPF: consulta.paci_CPF,
            ubs_nome: consulta.ubs_nome,
            area_nome: consulta.area_nome,
            horarios_dia: consulta.horarios_dia,
            horarios_horarios: consulta.horarios_horarios,
            consul_estado: consulta.consul_estado
        }));

        return { result: consultas };

    } catch (error) {
        console.error('Erro ao buscar as consultas:', error);
        
        if (error.message.includes('paci_id não fornecido')) {
            return { error: 'paci_id não foi fornecido.', result: {} };
        } else if (error.message.includes('Nenhuma consulta encontrada')) {
            return { error: 'Nenhuma consulta encontrada para o paciente.', result: {} };
        } else {
            return { error: `Erro ao buscar as consultas: ${error.message}`, result: {} };
        }
    }
},



  
    criarConsulta: async (paci_id, ubs_id, area_id, horarios_id, consul_estado) => {
        return new Promise((aceito, recusado) => {
            // Inicia uma transação para garantir que ambos os processos ocorram corretamente
            db.beginTransaction((transactionError) => {
                if (transactionError) {
                    recusado({ error: 'Erro ao iniciar transação.', details: transactionError });
                    return;
                }
   
                // Insere a nova consulta
                const queryConsulta = 'INSERT INTO consulta (paci_id, ubs_id, area_id, horarios_id, consul_estado) VALUES (?, ?, ?, ?, ?)';
                db.query(queryConsulta, [paci_id, ubs_id, area_id, horarios_id, consul_estado], (consultaError, consultaResults) => {
                    if (consultaError) {
                        db.rollback(() => {
                            recusado({ error: 'Erro ao criar a consulta.', details: consultaError });
                        });
                        return;
                    }
   
                    const consultaId = consultaResults.insertId;
   
                    // Atualiza o campo horarios_dispo para 0
                    const queryUpdateHorario = 'UPDATE datas_horarios SET horarios_dispo = 0 WHERE horarios_id = ?';
                    db.query(queryUpdateHorario, [horarios_id], (updateError) => {
                        if (updateError) {
                            db.rollback(() => {
                                recusado({ error: 'Erro ao atualizar o horário.', details: updateError });
                            });
                            return;
                        }
   
                        // Confirma a transação
                        db.commit((commitError) => {
                            if (commitError) {
                                db.rollback(() => {
                                    recusado({ error: 'Erro ao confirmar a transação.', details: commitError });
                                });
                                return;
                            }
   
                            aceito(consultaId); // Retorna o ID da consulta criada
                        });
                    });
                });
            });
        });
    },
   

    buscarAreaIdPorNome: async (area_nome) => {
        return new Promise((aceito, recusado) => {
            const query = 'SELECT area_id FROM areas_medicas WHERE area_nome = ?';
            db.query(query, [area_nome], (error, results) => {
                if (error || results.length === 0) {
                    recusado({ error: 'Erro ao buscar area_id.' });
                    return;
                }
                aceito(results[0].area_id);
            });
        });
    },

    buscarHorariosId: async (horarios_dia, horarios_horarios) => {
        return new Promise((aceito, recusado) => {
            const query = 'SELECT horarios_id FROM datas_horarios WHERE horarios_dia = ? AND horarios_horarios = ?';
            db.query(query, [horarios_dia, horarios_horarios], (error, results) => {
                if (error || results.length === 0) {
                    recusado({ error: 'Erro ao buscar horarios_id.' });
                    return;
                }
                aceito(results[0].horarios_id);
            });
        });
    },

   buscarExamesPorPaciente: (paci_id) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT 
              p.paci_nome, 
              p.paci_CPF, 
              p.paci_cel, 
              p.paci_email,
              e.exame_descricao,
              DATE_FORMAT(e.exame_dia, '%d/%m/%Y') AS exame_dia,
              DATE_FORMAT(e.exame_hora, '%H:%i') AS exame_hora,
              e.exame_resultado,
              u.ubs_nome
          FROM 
              paciente p
          INNER JOIN 
              exame e ON e.paci_id = p.paci_id
          INNER JOIN 
              ubs u ON e.ubs_id = u.ubs_id
          WHERE 
              p.paci_id = ?`;

      db.query(query, [paci_id], (error, results) => {
          if (error) {
              reject({ error: 'Erro ao buscar os exames e informações do paciente.', details: error });
              return;
          }

          // Mapeia e formata o campo exame_resultado
          const formattedResults = results.map((result) => {
              let formattedExameResultado = result.exame_resultado;

              // Verifica e formata o JSON como string
              try {
                  if (formattedExameResultado && typeof formattedExameResultado === 'string') {
                      // Converte a string JSON para objeto
                      const resultadoObj = JSON.parse(formattedExameResultado);

                      // Formata com espaçamento entre os itens
                      formattedExameResultado = Object.entries(resultadoObj)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n\n'); // Adiciona espaçamento entre os itens
                  }
              } catch (parseError) {
                  console.error('Erro ao converter exame_resultado para JSON:', parseError);
              }

              // Retorna o objeto atualizado com o exame_resultado formatado
              return {
                  ...result,
                  exame_resultado: formattedExameResultado // String final formatada
              };
          });

          resolve(formattedResults); // Retorna os dados formatados
      });
  });
},

   


    buscarReceitasPorPaciente: (paci_id) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT
              p.paci_nome,
              p.paci_CPF,
              u.ubs_nome,
              m.medi_nome,
              r.medicamento_nome,
              r.dosagem,
              r.frequencia_dosagem,
              r.tempo_uso,
              r.observacao_medica,
              DATE_FORMAT(r.data_emissao, '%d/%m/%Y') AS data_emissao,
              DATE_FORMAT(r.data_validade, '%d/%m/%Y') AS data_validade
          FROM
              paciente p
          INNER JOIN receita r ON r.paci_id = p.paci_id
          INNER JOIN ubs u ON r.ubs_id = u.ubs_id
          INNER JOIN medico m ON r.medi_id = m.medi_id
          WHERE
              p.paci_id = ?
      `;

      db.query(query, [paci_id], (error, results) => {
          if (error) {
              reject({ error: 'Erro ao buscar as receitas do paciente.', details: error });
              return;
          }

          // Formata e retorna os resultados
          const formattedResults = results.map((result) => ({
              paci_nome: result.paci_nome,
              paci_CPF: result.paci_CPF,
              ubs_nome: result.ubs_nome,
              medi_nome: result.medi_nome,
              medicamento_nome: result.medicamento_nome,
              dosagem: result.dosagem,
              frequencia_dosagem: result.frequencia_dosagem,
              tempo_uso: result.tempo_uso,
              observacao_medica: result.observacao_medica,
              data_emissao: result.data_emissao,
              data_validade: result.data_validade
          }));

          resolve(formattedResults); // Retorna os dados formatados
      });
  });
},

   
   
   

    buscarVacinasPorPaciente: (paci_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.paci_nome, p.paci_CPF, p.paci_cel, p.paci_email,
                       v.vacina_descricao, v.vacina_dia, v.vacina_hora, u.ubs_nome
                FROM paciente p
                INNER JOIN historico_paciente hp ON p.paci_id = hp.paci_id
                INNER JOIN vacina v ON v.vacina_id = hp.vacina_id
                INNER JOIN ubs u ON v.ubs_id = u.ubs_id
                WHERE p.paci_id = ?`;
   
            db.query(query, [paci_id], (error, results) => {
                if (error) {
                    reject({ error: 'Erro ao buscar os exames e informações do paciente.', details: error });
                    return;
                }
                resolve(results); // Retorna os dados do paciente, exames e nome da UBS
            });
        });
    },
   
    buscarPacienteIdPorNome: async (paci_nome) => {
        return new Promise((aceito, recusado) => {
            const query = 'SELECT paci_id FROM paciente WHERE paci_nome = ?';
           
            db.query(query, [paci_nome], (error, results) => {
                if (error) {
                    recusado({ error: 'Erro ao buscar o paciente.', details: error });
                    return;
                }
   
                if (results.length > 0) {
                    aceito(results[0].paci_id); // Retorna o paci_id encontrado
                } else {
                    aceito(null); // Se não encontrar, retorna null
                }
            });
        });
    },

    PaciNomePorId: async (paci_id) => {
        return new Promise((resolve, reject) => {
          const query = 'SELECT paci_nome FROM paciente WHERE paci_id = ?';
          db.query(query, [paci_id], (error, results) => {
            if (error) {
              reject(error);
            } else {
              if (results.length > 0) {
                resolve(results[0].paci_nome);
              } else {
                resolve(null); // Retorna null se não encontrar o paciente
              }
            }
          });
        });
      },
     
};