import React from "react";
import axios from 'axios';
import {useState} from 'react';
import { BotaoCliente, CamposCliente, FormCliente, InputEnderecoCliente, InputNomeCliente, InputTelefoneCliente, LabelCliente } from "../ClienteComponents/CadastroClienteComponents";
import {useForm} from 'react-hook-form';


function CadastroCliente (){
  const [cliente,setCliente] = useState([]);
  const {register,handleSubmit, reset} = useForm({}) 

  const onSubmit = async (data) =>{
    try{
      const response = await axios.post('http://localhost:3000/api/Paciente', data);
      console.log('Cliente Cadastrado:', response.data)
      
      //fazer card ser carregado na tela
      setCliente([...cliente, response.data.result]);
      
      //resetar campos
      reset();
    }catch(error){
      console.error('Erro ao cadastrar o Cliente:', error);
    }
  };

  return (
    <FormCliente onSubmit={handleSubmit(onSubmit)}>
        <CamposCliente>
          <LabelCliente>Nome:</LabelCliente>
          <InputNomeCliente type="text" {...register('cliente_nome')}></InputNomeCliente>
        </CamposCliente>
        <CamposCliente>
          <LabelCliente>Endereço:</LabelCliente>
          <InputEnderecoCliente type="text" {...register('cliente_endereco')}></InputEnderecoCliente>
        </CamposCliente>
        <CamposCliente>
          <LabelCliente>Telefone:</LabelCliente>
          <InputTelefoneCliente type="tel" {...register('cliente_telefone')}></InputTelefoneCliente>
        </CamposCliente>
        <BotaoCliente type="submit">CADASTRAR</BotaoCliente>
    </FormCliente>
  )
  
}
export default CadastroCliente;