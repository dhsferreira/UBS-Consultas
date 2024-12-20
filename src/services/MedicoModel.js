const { criarReceita } = require('../controllers/MedicoController');
const db = require('../db');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase diretamente no model
const supabaseUrl = 'https://mvxazgyzgiuivzngdbov.supabase.co'; // Substitua pela URL do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGF6Z3l6Z2l1aXZ6bmdkYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5ODcyMjMsImV4cCI6MjA0MzU2MzIyM30.Qg05UnatADTemLtofxUeI-b7CQqt3gb8bVNmuO7q5n0'; // Substitua pela sua chave de API
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports ={
    inserirMed: (medi_nome, medi_CPF, medi_cel, medi_email, medi_senha, medi_especializa, medi_CRM, medi_area, ubs_id) => {
        return new Promise((aceito, recusado) => {
            console.log("Iniciando a inserção no MySQL...");
            
            // Primeiro, insere no MySQL
            db.query(
                'INSERT INTO medico (medi_nome, medi_CPF, medi_cel, medi_email, medi_senha, medi_especializa, medi_CRM, medi_area, ubs_id) VALUES (?,?,?,?,?,?,?,?,?)',
                [medi_nome, medi_CPF, medi_cel, medi_email, medi_senha, medi_especializa, medi_CRM, medi_area, ubs_id],
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao inserir no MySQL:', error);
                        return recusado({ message: 'Erro ao inserir no MySQL', error });
                    }
    
                    console.log('Inserção no MySQL bem-sucedida, ID gerado:', results.insertId);
                    const medi_id = results.insertId;
    
                    try {
                        console.log("Iniciando a inserção no Supabase...");
    
                        // Agora insere no Supabase
                        const { data, error: supabaseError } = await supabase
                            .from('medico')
                            .insert([{
                                medi_id: medi_id, // Usando o medi_id gerado no MySQL
                                medi_nome: medi_nome,
                                medi_CPF: medi_CPF,
                                medi_cel: medi_cel,
                                medi_email: medi_email,
                                medi_senha: medi_senha,
                                medi_especializa: medi_especializa,
                                medi_CRM: medi_CRM,
                                medi_area: medi_area,
                                ubs_id: ubs_id
                            }]);
    
                        if (supabaseError) {
                            console.error('Erro ao inserir no Supabase:', supabaseError);
                            return recusado({ message: 'Erro ao inserir no Supabase', error: supabaseError });
                        }
    
                        console.log('Inserção no Supabase bem-sucedida:', data);
    
                        // Inserir na tabela areas_medicas
                        console.log("Iniciando a inserção na tabela areas_medicas...");
                        db.query(
                            'INSERT INTO areas_medicas (area_nome, medi_id) VALUES (?, ?)',
                            [medi_area, medi_id],
                            (areaError, areaResults) => {
                                if (areaError) {
                                    console.error('Erro ao inserir na tabela areas_medicas:', areaError);
                                    return recusado({ message: 'Erro ao inserir na tabela areas_medicas', error: areaError });
                                }
    
                                console.log('Inserção na tabela areas_medicas bem-sucedida:', areaResults);
                                aceito(medi_id); // Retorna o ID do médico que foi inserido
                            }
                        );
    
                    } catch (err) {
                        console.error('Erro durante a inserção no Supabase:', err);
                        return recusado({ message: 'Erro durante a inserção no Supabase', error: err });
                    }
                }
            );
        });
    },
    
    
    

    alterarDadosMedico: (medi_id, dados) => {
        return new Promise((aceito, recusado) => {
            const fieldsToUpdate = [];
            const valuesToUpdate = [];
   
            Object.keys(dados).forEach(key => {
                if (dados[key] !== undefined) {
                    fieldsToUpdate.push(`${key} = ?`);
                    valuesToUpdate.push(dados[key]);
                }
            });
   
            valuesToUpdate.push(medi_id);
   
            // Atualizando no MySQL
            db.query(
                `UPDATE medico SET ${fieldsToUpdate.join(', ')} WHERE medi_id = ?`,
                valuesToUpdate,
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao executar consulta de alteração de dados do médico no MySQL:', error);
                        recusado(error);
                        return;
                    }
   
                    console.log('Dados do médico alterados no MySQL com sucesso:', results);
   
                    // Atualizando também no Supabase
                    const { data, error: supabaseError } = await supabase
                        .from('medico')
                        .update(dados)
                        .eq('medi_id', medi_id);
   
                    if (supabaseError) {
                        console.error('Erro ao atualizar dados do médico no Supabase:', supabaseError);
                        recusado(supabaseError);
                        return;
                    }
   
                    console.log('Dados do médico alterados no Supabase com sucesso:', data);
                    aceito(results);
                }
            );
        });
    },
   


   adicionarReceita: (ubs_id, medi_id, paci_id, medicamento_nome, dosagem, frequencia_dosagem, tempo_uso, observacao_medica, data_emissao, data_validade) => {
  return new Promise((resolve, reject) => {
      const query = `
          INSERT INTO receita (
              ubs_id, medi_id, paci_id, medicamento_nome, dosagem,
              frequencia_dosagem, tempo_uso, observacao_medica,
              data_emissao, data_validade
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(query, [
          ubs_id, medi_id, paci_id, medicamento_nome, dosagem,
          frequencia_dosagem, tempo_uso, observacao_medica,
          data_emissao, data_validade
      ], (error, results) => {
          if (error) {
              reject({ error: 'Erro ao adicionar receita', details: error });
          } else {
              resolve(results.insertId); // Retorna o ID da receita recém-inserida
          }
      });
  });
},

    criarExame: async (exame_descricao, exame_dia, exame_hora, ubs_id) => {
        return new Promise((aceito, recusado) => {
            // Inicia uma transação para garantir que ambos os processos ocorram corretamente
            db.beginTransaction((transactionError) => {
                if (transactionError) {
                    recusado({ error: 'Erro ao iniciar transação.', details: transactionError });
                    return;
                }
   
                // Insere o novo exame
                const queryExame = 'INSERT INTO exame (exame_descricao, exame_dia, exame_hora, ubs_id) VALUES (?, ?, ?, ?)';
                db.query(queryExame, [exame_descricao, exame_dia, exame_hora, ubs_id], (exameError, exameResults) => {
                    if (exameError) {
                        db.rollback(() => {
                            recusado({ error: 'Erro ao criar o exame.', details: exameError });
                        });
                        return;
                    }
   
                    const exameId = exameResults.insertId;
   
                    // Confirma a transação
                    db.commit((commitError) => {
                        if (commitError) {
                            db.rollback(() => {
                                recusado({ error: 'Erro ao confirmar a transação.', details: commitError });
                            });
                            return;
                        }
   
                        aceito(exameId); // Retorna o ID do exame criado
                    });
                });
            });
        });
    },
   
TodosMediDeUmaUbs: (ubs_id) => {
    return new Promise((aceito, recusado) => {
        let query = `
            SELECT
                medico.medi_nome           -- Nome do médico
            FROM
                medico
            WHERE
                medico.ubs_id = ?
        `;

        db.query(query, [ubs_id], (error, results) => {
            if (error) {
                recusado({ error: 'Ocorreu um erro ao buscar os médicos.', details: error });
                return;
            }

            const medicos = results.map(result => ({
                medi_nome: result.medi_nome    // Nome do médico
            }));

            aceito(medicos);
        });
    });
},

TodosMediDeUmaArea: (area_nome) => {
    return new Promise((resolve, reject) => {
        console.log(`[INFO] Iniciando busca de médicos para a área: ${area_nome}`); // Log de início

        // Consulta para buscar os medi_nome dos médicos associados à área_nome
        let query = `
            SELECT m.medi_nome
            FROM medico m
            INNER JOIN areas_medicas a ON m.medi_id = a.medi_id
            WHERE a.area_nome = ?
        `;

        console.log(`[INFO] Executando consulta para buscar médicos para a área: ${area_nome}`);

        db.query(query, [area_nome], (error, results) => {
            if (error) {
                console.error(`[ERROR] Falha ao buscar médicos para a área: ${area_nome}`, error);
                reject({ error: 'Erro ao buscar médicos pela área.', details: error });
                return;
            }

            console.log(`[INFO] Resultados da consulta:`, results);

            // Se nenhum médico for encontrado, retorna uma lista vazia
            if (results.length === 0) {
                console.warn(`[WARN] Nenhum médico encontrado para a área: ${area_nome}`);
                resolve([]);  // Retorna um array vazio
                return;
            }

            // Formatar os resultados com os nomes dos médicos
            const medicos = results.map(result => ({
                medi_nome: result.medi_nome
            }));

            resolve(medicos); // Resolve com os médicos encontrados
        });
    });
},








    ///////////////////////////////////////////////////////////////////////////
  umaconsul: (paci_id, data) => {
    return new Promise((aceito, recusado) => {
        let query = `
            SELECT
                paciente.paci_nome,
                paciente.paci_cpf,
                ubs.ubs_nome,
                areas_medicas.area_nome,
                DATE_FORMAT(datas_horarios.horarios_dia, '%d/%m/%Y') AS horarios_dia,
                datas_horarios.horarios_horarios,
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

        if (data) {
            query += ` AND DATE(datas_horarios.horarios_dia) = ?`;
        }

        db.query(query, data ? [paci_id, data] : [paci_id], (error, results) => {
            if (error) {
                recusado({ error: 'Ocorreu um erro ao buscar a consulta.', details: error });
                return;
            }

            const consultas = results.map(consulta => {
                let estado_texto;
                switch (consulta.consul_estado) {
                    case 1:
                        estado_texto = 'Em espera';
                        break;
                    case 2:
                        estado_texto = 'Em andamento';
                        break;
                    case 3:
                        estado_texto = 'Finalizada';
                        break;
                    case 4:
                        estado_texto = 'Cancelada';
                        break;
                    default:
                        estado_texto = 'Estado desconhecido';
                }
                return {
                    paci_nome: consulta.paci_nome,
                    paci_cpf: consulta.paci_cpf,
                    ubs_nome: consulta.ubs_nome,
                    area_nome: consulta.area_nome,
                    horarios_dia: consulta.horarios_dia, // Data já formatada
                    horarios_horarios: consulta.horarios_horarios,
                    consul_estatos: estado_texto
                };
            });

            aceito(consultas);
        });
    });
},


     


/*///////////////////////////////////////////////////////////////////
criarConsulta: (paci_id, ubs_id, area_id, horarios_id, consul_estado) => {
    return new Promise((aceito, recusado) => {
        const query = 'INSERT INTO consulta (paci_id, ubs_id, area_id, horarios_id, consul_estado) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [paci_id, ubs_id, area_id, horarios_id, consul_estado], (error, results) => {
            if (error) {
                recusado({ error: 'Erro ao criar a consulta.', details: error });
                return;
            }
            aceito(results.insertId); // Retorna o ID da consulta criada
        });
    });
},
/////////////////////////////////////////////////////////////*/
buscarConsultasPorData: (dia) => {
    return new Promise((aceito, recusado) => {
      db.query(
        `SELECT  paciente.paci_nome, areas_medicas.area_nome, datas_horarios.horarios_dia, datas_horarios.horarios_horarios,consulta.consul_estado
        FROM consulta
        INNER JOIN datas_horarios ON consulta.horarios_id = datas_horarios.horarios_id
        INNER JOIN paciente ON consulta.paci_id = paciente.paci_id
        INNER JOIN areas_medicas ON consulta.area_id = areas_medicas.area_id
        WHERE DATE(datas_horarios.horarios_dia) = ?`,
        [dia],
        (error, results) => {
          if (error) {
            recusado({ error: 'Erro ao buscar as consultas.', details: error });
            return;
          }
 
          // Mapeamento dos estados das consultas para texto
          const consultas = results.map(consulta => {
            let estado_texto;
            switch (consulta.consul_estado) {
              case 1:
                estado_texto = 'Em espera';
                break;
              case 2:
                estado_texto = 'Em andamento';
                break;
              case 3:
                estado_texto = 'Finalizada';
                break;
              case 4:
                estado_texto = 'Cancelada';
                break;
              default:
                estado_texto = 'Estado desconhecido';
            }
            // Retorna um novo objeto com as informações relevantes e o texto do estado
            return {
              paci_nome: consulta.paci_nome,
              area_nome: consulta.area_nome,
              horarios_dia: consulta.horarios_dia,
              horarios_horarios: consulta.horarios_horarios,
              consul_estatos: estado_texto
            };
          });
 
          aceito(consultas);
        }
      );
    });
  },
  /*///////////////////////////////////////////////////////////////*/
  buscarAreaIdPorNome: (area_nome) => {
    return new Promise((aceito, recusado) => {
        const query = 'SELECT area_id FROM areas_medicas WHERE area_nome = ?';
        db.query(query, [area_nome], (error, results) => {
            if (error || results.length === 0) {
                recusado({ error: 'Área não encontrada.', details: error });
                return;
            }
            aceito(results[0].area_id);
        });
    });
},

// Função para buscar horarios_id pelos parâmetros dia e horário
buscarHorariosId: (horarios_dia, horarios_horarios) => {
    return new Promise((aceito, recusado) => {
        const query = 'SELECT horarios_id FROM datas_horarios WHERE horarios_dia = ? AND horarios_horarios = ?';
        db.query(query, [horarios_dia, horarios_horarios], (error, results) => {
            if (error || results.length === 0) {
                recusado({ error: 'Horário não encontrado.', details: error });
                return;
            }
            aceito(results[0].horarios_id);
        });
    });
},

// Função para criar uma nova consulta
criarConsulta: async (paci_id, ubs_id, area_nome, horarios_dia, horarios_horarios, consul_estado) => {
    return new Promise(async (aceito, recusado) => {
        try {
            const area_id = await module.exports.buscarAreaIdPorNome(area_nome);
            const horarios_id = await module.exports.buscarHorariosId(horarios_dia, horarios_horarios);

            const query = 'INSERT INTO consulta (paci_id, ubs_id, area_id, horarios_id, consul_estado) VALUES (?, ?, ?, ?, 1)';
            db.query(query, [paci_id, ubs_id, area_id, horarios_id, consul_estado], (error, results) => {
                if (error) {
                    recusado({ error: 'Erro ao criar a consulta.', details: error });
                    return;
                }
                aceito(results.insertId); // Retorna o ID da consulta criada
            });
        } catch (error) {
            recusado(error);
        }
    });
},




}