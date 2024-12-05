const express = require('express');
const router = express.Router();


const PacientesController = require('./controllers/PacientesController');
const SistemaController = require('./controllers/SistemaController');
const MedicoController = require('./controllers/MedicoController');
const UbsController = require ('./controllers/UbsController');
const RecepcionistaController = require('./controllers/RecepcionistaController');
const HorarioController = require('./controllers/HorarioController');



//----------------------------CONSULTA-----------------------------------//
router.get('/Consulta/:paci_id', PacientesController.TodasConsultasDeUmPaci);
//router.get('/consultas/:dia', consultaController.buscarConsultasPorData);

//router.post('/consul', consultaController.criarConsulta);


//----------------------------RECEPCIONISTA-----------------------------------//
router.post('/Recep',RecepcionistaController.inserir);//#
router.get('/Recep', RecepcionistaController.buscarTodos);
router.post('/Recep', RecepcionistaController.inserir);
router.post('/login', RecepcionistaController.login);
router.put('/consultaEstato/:consul_id', RecepcionistaController.alterarEstadoConsulta);
router.post('/horario/:area_id', RecepcionistaController.adicionarHorarioEArea);




//----------------------------UBS-----------------------------------//
router.get('/Ubs', UbsController.buscarNomes);
router.get('/Ubs/:id/areas', UbsController.buscarAreasPorUbsId);





//----------------------------HORARIOS-----------------------------------//

router.get('/Horario/:area_id', HorarioController.buscarUm);
router.get('/Horarios/:area_id', HorarioController.buscarHorariosdoDia);
router.get('/horari/:area_id/:dia', HorarioController.buscarHorariosPorDia);
router.get('/horarios/:ubs_id/:area_id', HorarioController.buscarHorariosPorAreaEUbs);
router.get('/horario/dia/:ubs_id/:area_nome', HorarioController.buscarHorariosDiaPorUbsEAreaNome);
router.get('/horario/horario/:ubs_id/:area_nome/:horarios_dia', HorarioController.buscarHorariosPorUbsAreaEDia);

//##################################################################################//
//#################################################################################//

router.post('/horarios/adicionar', HorarioController.adicionarDiasHorarios);

router.delete('/horarios/remover/passados', HorarioController.removerDiasHorariosPassados);
//----------------------------SISTEMA GLOBAL-----------------------------------//
router.get('/areas/:ubs_id', SistemaController.buscarAreasPorUBS); //#
router.get('/ubs/:ubs_id/areas/:area_nome/horarios', SistemaController.buscarHorariosDiaPorUbsEAreaNome);//#
router.get('/ubs/:ubs_id/area/:area_nome/horario', SistemaController.buscarHorariosDiaPorUbsEAreaNome2);//#
router.get('/horario/:ubs_id/:area_nome/:horarios_dia', SistemaController.buscarHorariosPorUbsAreaEDia);//#
router.get('/horarios/:ubs_id/:area_nome/:horarios_dia', SistemaController.buscarHorariosPorUbsAreaEDia2);//#
router.get('/ubs/nomes', SistemaController.listarTodosUBS);//#
router.get('/Ubs/:id/nome', SistemaController.buscarNomePorId);//#

//----------------------------PACIENTE-----------------------------------//
router.post('/Paciente', PacientesController.inserir);//#
router.put('/paciente/:paci_id', PacientesController.alterarDadosPaciente);//#
router.get('/Consulta/:paci_id', PacientesController.TodasConsultasDeUmPaci);//#*
router.post('/consultas/criar', PacientesController.criarConsulta);//#*
router.get('/paciente/:paci_id/exames', PacientesController.listarExamesPorPaciente);//#
router.get('/paciente/:paci_id/receitas', PacientesController.ReceitasPorPaciente);//#
router.get('/paciente/:paci_id/vacinas', PacientesController.listarVacinasPorPaciente);//#
router.get('/BuscarNome/:paci_nome', PacientesController.buscarPacientePorNome);
router.get('/Nome/:paci_id', PacientesController.PaciNomePorId);
//----------------------------RECEPCIONISTA-----------------------------------//
router.post('/recepcionista', RecepcionistaController.inserirRecep);//#
router.put('/recepcionista/:recep_id', RecepcionistaController.alterarDadosRecepcionista);//#
router.get('/Consulta/ubs/:ubs_id', RecepcionistaController.TodasConsultasDeUmaUbs);//#
router.get('/consultas/ubs/:ubs_id/horario_dia/:horarios_dia', RecepcionistaController.TodasConsultasDeUmaUbsPorDia);
router.get('/consultas/ubs/:ubs_id/area/:area_nome', RecepcionistaController.TodasConsultasDeUbsArea);
router.get('/consultas/ubs/:ubs_id/area/:area_nome/dia/:dia', RecepcionistaController.TodasConsultasDeUbsAreaDia);
router.put('/consulta/:consul_id/estado', RecepcionistaController.alterarEstadoConsulta);
router.post('/adicionarHorarioAreaMedica', RecepcionistaController.adicionarHorarioAreaMedica);
router.get('/buscarHorariosNaoVinculados/:horarios_dia', RecepcionistaController.buscarHorariosNaoVinculados);
router.get('/buscarDiasNaoVinculados', RecepcionistaController.buscarDiasNaoVinculados);
//----------------------------MEDICO-----------------------------------//
router.post('/medico', MedicoController.inserirMed);//#
router.put('/medico/:medi_id', MedicoController.alterarDadosMedico);//#
router.post('/criarReceita', MedicoController.adicionarReceita);
router.post('/criarExame', MedicoController.criarExame);
module.exports = router;

