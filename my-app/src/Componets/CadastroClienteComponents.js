import styled from 'styled-components';

export const LabelCliente = styled.label`
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;
export const FormCliente = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2.0rem;
  margin-bottom: 10.0rem;
  margin-top: 8rem;
`;

export const CamposCliente = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InputNomeCliente = styled.input`
  width: 40.0rem;
  height: 5rem;
  background: #FFFF;
  border: 1px solid #CCC;
  border-radius: .8rem;
  padding-left: 1rem;
`;
export const InputEnderecoCliente = styled.input`
  width: 40.0rem;
  height: 5rem;
  background: #FFFF;
  border: 1px solid #CCC;
  border-radius: .8rem;
  padding-left: 1rem;
`;
export const InputTelefoneCliente = styled.input`
  width: 40.0rem;
  height: 5rem;
  background: #FFFF;
  border: 1px solid #CCC;
  border-radius: .8rem;
  padding-left: 1rem;
`;
export const BotaoCliente = styled.button`
  width: 40.0rem;
  background-color: blue;
  color:#000;
  border: none;
  border-radius: .8rem;
  height: 4.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;

  &:hover{
    background-color: blue;
    color: #000;
  }
`;