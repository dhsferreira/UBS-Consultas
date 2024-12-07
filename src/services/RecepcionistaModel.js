const db = require('../db');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase diretamente no model
const supabaseUrl = 'https://mvxazgyzgiuivzngdbov.supabase.co'; // Substitua pela URL do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGF6Z3l6Z2l1aXZ6bmdkYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5ODcyMjMsImV4cCI6MjA0MzU2MzIyM30.Qg05UnatADTemLtofxUeI-b7CQqt3gb8bVNmuO7q5n0'; // Substitua pela sua chave de API
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {

    inserirRecep: (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) => {
        return new Promise((aceito, recusado) => {
            console.log("Iniciando a inserção no MySQL...");
            
            // Logando os parâmetros antes da inserção
            console.log('Parâmetros para inserção no MySQL:', {
                recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id
            });
    
            // Primeiro, insere no MySQL
            db.query(
                'INSERT INTO recepcionista (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) VALUES (?,?,?,?,?,?)',
                [recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id],
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao inserir no MySQL:', error);
                        return recusado({ message: 'Erro ao inserir no MySQL', error });
                    }
    
                    console.log('Inserção no MySQL bem-sucedida, ID gerado:', results.insertId);
                    const recep_id = results.insertId;
    
                    try {
                        console.log("Iniciando a inserção no Supabase...");
    
                        // Logando os dados a serem inseridos no Supabase
                        console.log('Dados para inserção no Supabase:', {
                            recep_id, recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id
                        });
    
                        // Agora insere no Supabase
                        const { data, error: supabaseError } = await supabase
                            .from('recepcionista')
                            .insert([{
                                recep_id: recep_id, // Usando o recep_id gerado no MySQL
                                recep_nome: recep_nome,
                                recep_CPF: recep_CPF,
                                recep_cel: recep_cel,
                                recep_email: recep_email,
                                recep_senha: recep_senha,
                                ubs_id: ubs_id
                            }]);
    
                        if (supabaseError) {
                            console.error('Erro ao inserir no Supabase:', supabaseError);
                            return recusado({ message: 'Erro ao inserir no Supabase', error: supabaseError });
                        }
    
                        console.log('Inserção no Supabase bem-sucedida:', data);
                        aceito(recep_id); // Retorna o ID do recepcionista que foi inserido
    
                    } catch (err) {
                        console.error('Erro durante a inserção no Supabase:', err);
                        return recusado({ message: 'Erro durante a inserção no Supabase', error: err });
                    }
                }
            );
        });
    },
    
    

    alterarDadosRecepcionista: (recep_id, dados) => {
        return new Promise((aceito, recusado) => {
            const fieldsToUpdate = [];
            const valuesToUpdate = [];

            Object.keys(dados).forEach(key => {
                if (dados[key] !== undefined) {
                    fieldsToUpdate.push(`${key} = ?`);
                    valuesToUpdate.push(dados[key]);
                }
            });

            valuesToUpdate.push(recep_id);

            // Atualizando no MySQL
            db.query(
                `UPDATE recepcionista SET ${fieldsToUpdate.join(', ')} WHERE recep_id = ?`,
                valuesToUpdate,
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao executar consulta de alteração de dados da recepcionista no MySQL:', error);
                        recusado(error);
                        return;
                    }

                    console.log('Dados da recepcionista alterados no MySQL com sucesso:', results);

                    // Atualizando também no Supabase
                    const { data, error: supabaseError } = await supabase
                        .from('recepcionista')
                        .update(dados)
                        .eq('recep_id', recep_id);

                    if (supabaseError) {
                        console.error('Erro ao atualizar dados da recepcionista no Supabase:', supabaseError);
                        recusado(supabaseError);
                        return;
                    }

                    console.log('Dados da recepcionista alterados no Supabase com sucesso:', data);
                    aceito(results);
                }
            );
        });
    },


    TodasConsultasDeUmaUbs: (ubs_id, data) => {
        return new Promise((aceito, recusado) => {
            let query = `
                SELECT
                    consulta.consul_id,            -- Adicionado consul_id
                    paciente.paci_nome,
                    paciente.paci_cpf,
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
                    consulta.ubs_id = ?
            `;

            if (data) {
                query += ` AND DATE(datas_horarios.horarios_dia) = ?`;
            }

            db.query(query, data ? [ubs_id, data] : [ubs_id], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar as consultas.', details: error });
                    return;
                }

                const consultas = results.map(consulta => ({
                    consul_id: consulta.consul_id,     // Incluído consul_id no resultado
                    paci_nome: consulta.paci_nome,
                    paci_cpf: consulta.paci_cpf,
                    ubs_nome: consulta.ubs_nome,
                    area_nome: consulta.area_nome,
                    horarios_dia: consulta.horarios_dia, // Data já formatada
                    horarios_horarios: consulta.horarios_horarios, // Horário sem segundos
                    consul_estado: consulta.consul_estado
                }));

                aceito(consultas);
            });
        });
    },

    TodasConsultasDeUmaUbsPorDia: (ubs_id, horarios_dia) => {
        return new Promise((aceito, recusado) => {
            let query = `
                SELECT
                    paciente.paci_nome,
                    paciente.paci_cpf,
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
                    consulta.ubs_id = ?
                    AND DATE(datas_horarios.horarios_dia) = ?
            `;

            db.query(query, [ubs_id, horarios_dia], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar as consultas.', details: error });
                    return;
                }

                const consultas = results.map(consulta => ({
                    paci_nome: consulta.paci_nome,
                    paci_cpf: consulta.paci_cpf,
                    ubs_nome: consulta.ubs_nome,
                    area_nome: consulta.area_nome,
                    horarios_dia: consulta.horarios_dia, // Data já formatada
                    horarios_horarios: consulta.horarios_horarios, // Horário sem segundos
                    consul_estado: consulta.consul_estado
                }));

                aceito(consultas);
            });
        });
    },

    TodasConsultasDeUbsArea: (ubs_id, area_nome, data) => {
        return new Promise((aceito, recusado) => {
            let query = `
                SELECT
                    paciente.paci_nome,
                    paciente.paci_cpf,
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
                    consulta.ubs_id = ? AND areas_medicas.area_nome = ?
            `;

            if (data) {
                query += ` AND DATE(datas_horarios.horarios_dia) = ?`;
            }

            db.query(query, data ? [ubs_id, area_nome, data] : [ubs_id, area_nome], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar as consultas.', details: error });
                    return;
                }

                const consultas = results.map(consulta => ({
                    paci_nome: consulta.paci_nome,
                    paci_cpf: consulta.paci_cpf,
                    ubs_nome: consulta.ubs_nome,
                    area_nome: consulta.area_nome,
                    horarios_dia: consulta.horarios_dia, // Data já formatada
                    horarios_horarios: consulta.horarios_horarios, // Horário sem segundos
                    consul_estado: consulta.consul_estado
                }));

                aceito(consultas);
            });
        });
    },

    TodasConsultasDeUbsAreaDia: (ubs_id, area_nome, dia) => {
        return new Promise((aceito, recusado) => {
            let query = `
                SELECT
                    paciente.paci_nome,
                    paciente.paci_cpf,
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
                    consulta.ubs_id = ?
                    AND areas_medicas.area_nome = ?
                    AND DATE(datas_horarios.horarios_dia) = ?
            `;

            db.query(query, [ubs_id, area_nome, dia], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar as consultas.', details: error });
                    return;
                }

                const consultas = results.map(consulta => ({
                    paci_nome: consulta.paci_nome,
                    paci_cpf: consulta.paci_cpf,
                    ubs_nome: consulta.ubs_nome,
                    area_nome: consulta.area_nome,
                    horarios_dia: consulta.horarios_dia, // Data já formatada
                    horarios_horarios: consulta.horarios_horarios, // Horário sem segundos
                    consul_estado: consulta.consul_estado
                }));

                aceito(consultas);
            });
        });
    },


    alterarEstadoConsulta: (consul_id, consul_estado) => {
        return new Promise((aceito, recusado) => {
            db.query(
                'UPDATE consulta SET consul_estado = ? WHERE consul_id = ?',
                [consul_estado, consul_id],
                (error, results) => {
                    if (error) {
                        console.error('Erro ao executar consulta de alteração de estado da consulta:', error);
                        recusado(error);
                        return;
                    }

                    // Verifica quantas linhas foram afetadas pela alteração
                    if (results.affectedRows > 0) {
                        console.log('Estado da consulta alterado com sucesso:', results);
                    } else {
                        console.log('Nenhuma linha foi afetada (consulta não encontrada ou estado já alterado).');
                    }

                    aceito(results);
                }
            );
        });
    },

    adicionarHorarioAreaMedica: async (area_nome, horarios_dia, horarios_horarios) => {
        return new Promise((aceito, recusado) => {
            // Primeiro, buscar o area_id com base no area_nome
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
                        console.error('Área não encontrada:', area_nome);
                        recusado({ error: 'Área não encontrada.' });
                        return;
                    }

                    const area_id = results[0].area_id;

                    // Buscar o horarios_id existente com base em horarios_dia e horarios_horarios
                    db.query(
                        'SELECT horarios_id FROM datas_horarios WHERE horarios_dia = ? AND horarios_horarios = ? AND horarios_dispo = 1',
                        [horarios_dia, horarios_horarios],
                        (error, results) => {
                            if (error) {
                                console.error('Erro ao buscar o ID do horário:', error);
                                recusado({ error: 'Erro ao buscar o ID do horário.', details: error });
                                return;
                            }

                            if (results.length === 0) {
                                console.error('Horário não encontrado ou não disponível:', horarios_dia, horarios_horarios);
                                recusado({ error: 'Horário não encontrado ou não disponível.' });
                                return;
                            }

                            const horarios_id = results[0].horarios_id;

                            // Associar o horário existente à área médica na tabela horarios_areas
                            db.query(
                                'INSERT INTO horarios_areas (horarios_id, area_id) VALUES (?, ?)',
                                [horarios_id, area_id],
                                (error, results) => {
                                    if (error) {
                                        console.error('Erro ao associar horário à área médica:', error);
                                        recusado({ error: 'Erro ao associar horário à área médica.', details: error });
                                        return;
                                    }

                                    // Opcional: Atualizar horarios_dispo para 0 se desejado
                                    db.query(
                                        'UPDATE datas_horarios SET horarios_dispo = 0 WHERE horarios_id = ?',
                                        [horarios_id],
                                        (error) => {
                                            if (error) {
                                                console.error('Erro ao atualizar a disponibilidade do horário:', error);
                                                recusado({ error: 'Erro ao atualizar a disponibilidade do horário.', details: error });
                                                return;
                                            }

                                            aceito({ message: 'Horário associado à área médica com sucesso!', horarios_id });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    },



    buscarHorariosNaoVinculados: async (horarios_dia) => {
        return new Promise((aceito, recusado) => {
            const query = `
                SELECT horarios_id
                FROM datas_horarios
                WHERE DATE(horarios_dia) = ?
            `;
    
            db.query(query, [horarios_dia], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar os horários.', details: error });
                    return;
                }
    
                // Verificando se algum resultado foi encontrado
                if (results.length === 0) {
                    recusado({ error: 'Nenhum horário encontrado para a data fornecida.' });
                    return;
                }
    
                // Obter os horarios_id encontrados na tabela datas_horarios
                const horariosIds = results.map(horario => horario.horarios_id);
    
                // Consultar os horarios_id que já estão vinculados na tabela horarios_areas
                const checkQuery = `
                    SELECT horarios_id
                    FROM horarios_areas
                    WHERE horarios_id IN (?)`;
    
                db.query(checkQuery, [horariosIds], (checkError, checkResults) => {
                    if (checkError) {
                        recusado({ error: 'Erro ao verificar os horários vinculados.', details: checkError });
                        return;
                    }
    
                    // Filtrando os horarios_id não vinculados
                    const horariosVinculados = checkResults.map(horario => horario.horarios_id);
                    const horariosNaoVinculados = horariosIds.filter(id => !horariosVinculados.includes(id));
    
                    if (horariosNaoVinculados.length === 0) {
                        recusado({ error: 'Todos os horários para essa data já estão vinculados.' });
                        return;
                    }
    
                    // Buscar os detalhes dos horários não vinculados (horarios_horarios)
                    const detalhesQuery = `
                        SELECT horarios_horarios
                        FROM datas_horarios
                        WHERE horarios_id IN (?)`;
    
                    db.query(detalhesQuery, [horariosNaoVinculados], (detalhesError, detalhesResults) => {
                        if (detalhesError) {
                            recusado({ error: 'Erro ao buscar os detalhes dos horários.', details: detalhesError });
                            return;
                        }
    
                        // Retorna os detalhes dos horarios não vinculados
                        aceito(detalhesResults);
                    });
                });
            });
        });
    },
    
    

      
      
      

    
    
    
    




      buscarDiasNaoVinculados: async () => {
        return new Promise((aceito, recusado) => {
            const query = `
                SELECT DISTINCT dh.horarios_dia
                FROM datas_horarios dh
                LEFT JOIN horarios_areas ha ON dh.horarios_id = ha.horarios_id
                WHERE ha.horarios_id IS NULL
                ORDER BY dh.horarios_dia ASC
            `;
            db.query(query, (error, results) => {
                if (error) {
                    console.error('Erro ao buscar os dias não vinculados:', error);
                    recusado({ error: 'Erro ao buscar os dias não vinculados.', details: error });
                    return;
                }
    
                // Formatar as datas para o formato "YYYY-MM-DD"
                const diasFormatados = results.map(result => {
                    const date = new Date(result.horarios_dia); // Supondo que 'horarios_dia' é a propriedade que contém a data
                    return date.toISOString().slice(0, 10); // Formato: "YYYY-MM-DD"
                });
    
                aceito(diasFormatados); // Retorna as datas formatadas
            });
        });
    },
    


    TodasRecepDeUmaUbs: (ubs_id) => {
        return new Promise((aceito, recusado) => {
            let query = `
                SELECT
                    recepcionista.recep_nome           -- Nome do recepcionista
                FROM
                    recepcionista
                WHERE
                    recepcionista.ubs_id = ?
            `;
    
            db.query(query, [ubs_id], (error, results) => {
                if (error) {
                    recusado({ error: 'Ocorreu um erro ao buscar os recepcionistas.', details: error });
                    return;
                }
    
                const recepcionistas = results.map(result => ({
                    recep_nome: result.recep_nome    // Nome do recepcionista
                }));
    
                aceito(recepcionistas);
            });
        });
    },
    
    







    /////////////////////////////////////////////////////////////////////
    inserir: (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) => {
        return new Promise((aceito, recusado) => {
            // Primeiro, insere no MySQL
            db.query(
                'INSERT INTO recepcionista (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) VALUES (?,?,?,?,?,?)',
                [recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id],
                async (error, results) => {
                    if (error) {
                        console.error('Erro ao inserir no MySQL:', error);
                        recusado(error);
                        return;
                    }

                    const recep_id = results.insertId;

                    try {
                        // Agora insere no Supabase
                        const { data, error: supabaseError } = await supabase
                            .from('recepcionista')
                            .insert([
                                {
                                    recep_id: recep_id, // ID gerado pelo MySQL
                                    recep_nome: recep_nome,
                                    recep_cpf: recep_CPF,
                                    recep_cel: recep_cel,
                                    recep_email: recep_email,
                                    recep_senha: recep_senha,
                                    ubs_id: ubs_id
                                }
                            ]);

                        if (supabaseError) {
                            console.error('Erro ao inserir no Supabase:', supabaseError);
                            recusado(supabaseError); // Retorna erro do Supabase
                            return;
                        }

                        console.log('Inserção no Supabase bem-sucedida:', data);
                        aceito(recep_id); // Retorna o ID da recepcionista inserido
                    } catch (err) {
                        console.error('Erro durante a inserção no Supabase:', err);
                        recusado(err);
                    }
                }
            );
        });
    },
    buscarTodos: () =>{        // -------------------------LISTAR TODOS--------------------------------- //
        return new Promise((aceito, recusado)=>{

            db.query('SELECT * FROM recepcionista', (error, results)=>{
                if(error) { recusado(error); return; }
                aceito(results);
            });
        });
    },


// Model/*
inserir: (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) => {
    return new Promise((aceito, recusado) => {
        db.query('INSERT INTO recepcionista (recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id) VALUES (?,?,?,?,?,?)',
            [recep_nome, recep_CPF, recep_cel, recep_email, recep_senha, ubs_id],
            (error, results) => {
                if (error) {
                    recusado(new Error('Erro ao inserir os dados do recepcionista: ' + error.message));
                    return;
                }
                aceito(results.insertId);
            }
        );
    });
},


/*
verificarLogin: (recep_CPF, recep_senha) => {
    return new Promise((aceito, recusado) => {
      db.query(
        'SELECT * FROM recepcionista WHERE recep_CPF = ? AND recep_senha = ?',
        [recep_CPF, recep_senha],
        (error, results) => {
          if (error) {
            recusado({ error: 'Erro ao verificar o login da recepcionista.', details: error });
            return;
          }

          if (results.length > 0) {
            aceito(true); // Login bem-sucedido
          } else {
            aceito(false); // Login falhou
          }
        }
      );
    });
  },
// Adicione esta função ao seu modelo de consulta
alterarEstadoConsulta: (consul_id, consul_estado) => {
    return new Promise((aceito, recusado) => {
        db.query(
            'UPDATE consulta SET consul_estado = ? WHERE consul_id = ?',
            [consul_estado, consul_id],
            (error, results) => {
                if (error) {
                    console.error('Erro ao executar consulta de alteração de estado da consulta:', error);
                    recusado(error);
                    return;
                }
                console.log('Estado da consulta alterado com sucesso:', results);
                aceito(results);
            }
        );
    });
},

*/

adicionarHorarioEArea: (horarios_dia, horarios_horarios, area_id) => {
    return new Promise((aceito, recusado) => {
        db.query(
            'INSERT INTO datas_horarios (horarios_dia, horarios_horarios, horarios_dispo) VALUES (?, ?, 1)',
            [horarios_dia, horarios_horarios],
            (error, results) => {
                if (error) {
                    recusado({ error: 'Erro ao adicionar horário.', details: error });
                    return;
                }

                const horarios_id = results.insertId;

                // Vincular horário à área
                db.query(
                    'INSERT INTO horarios_areas (area_id, horarios_id) VALUES (?, ?)',
                    [area_id, horarios_id],
                    (error, results) => {
                        if (error) {
                            recusado({ error: 'Erro ao vincular horário à área.', details: error });
                            return;
                        }
                        aceito({ horarios_id, area_id });
                    }
                );
            }
        );
    });
},



}