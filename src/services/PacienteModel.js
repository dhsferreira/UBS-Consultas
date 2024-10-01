const db = require('../db');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase diretamente no model
const supabaseUrl = 'https://gtlntaigxnnlsalocafi.supabase.co'; // Substitua pela URL do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bG50YWlneG5ubHNhbG9jYWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA0NzM5NDMsImV4cCI6MjAzNjA0OTk0M30.GFUMf21m2yYm3lwrdisu-6Mt7AC3fqiRKRCckBpionA'; // Substitua pela sua chave de API
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

    TodasConsultasDeUmPaci: (paci_id, data) => {
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
                SELECT p.paci_nome, p.paci_CPF, p.paci_cel, p.paci_email,
                       e.exame_descricao, e.exame_dia, e.exame_hora, u.ubs_nome
                FROM paciente p
                INNER JOIN historico_paciente hp ON p.paci_id = hp.paci_id
                INNER JOIN exame e ON e.exame_id = hp.exame_id
                INNER JOIN ubs u ON e.ubs_id = u.ubs_id
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

    buscarReceitasPorPaciente: (paci_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT u.ubs_nome, u.ubs_indereco, 
                       CONCAT(SUBSTRING(u.ubs_cel, 1, 2), ' ', 
                              SUBSTRING(u.ubs_cel, 3, 5), '-', 
                              SUBSTRING(u.ubs_cel, 8, 4)) AS ubs_cel, -- Formatação do telefone da UBS
                       m.medi_nome, m.medi_CRM, m.medi_especializa, 
                       p.paci_nome,
                       CONCAT(SUBSTRING(p.paci_CPF, 1, 3), '.', 
                              SUBSTRING(p.paci_CPF, 4, 3), '.', 
                              SUBSTRING(p.paci_CPF, 7, 3), '-', 
                              SUBSTRING(p.paci_CPF, 10, 2)) AS paci_CPF,
                       CONCAT('(', SUBSTRING(p.paci_cel, 1, 2), ') ', 
                              SUBSTRING(p.paci_cel, 3, 4), '-', 
                              SUBSTRING(p.paci_cel, 7, 4)) AS paci_cel, -- Formatação do celular do paciente
                       DATE_FORMAT(p.paci_data_nascimento, '%d-%m-%Y') AS paci_data_nascimento, 
                       r.medicamento_nome, r.dosagem, r.frequencia_dosagem, r.tempo_uso, 
                       IFNULL(r.observacao_medica, '') AS observacao_medica, -- Retorna string vazia se NULL
                       DATE_FORMAT(r.data_emissao, '%d-%m-%Y') AS data_emissao, 
                       DATE_FORMAT(r.data_validade, '%d-%m-%Y') AS data_validade
                FROM historico_paciente hp
                INNER JOIN paciente p ON hp.paci_id = p.paci_id
                INNER JOIN receita r ON hp.receita_id = r.receita_id
                INNER JOIN ubs u ON r.ubs_id = u.ubs_id
                INNER JOIN medico m ON r.medi_id = m.medi_id
                WHERE p.paci_id = ?`;
    
            db.query(query, [paci_id], (error, results) => {
                if (error) {
                    reject({ error: 'Erro ao buscar as receitas e informações do paciente.', details: error });
                    return;
                }
                resolve(results);
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
    
     
};
