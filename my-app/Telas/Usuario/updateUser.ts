// updateUser.ts
import { supabase } from '../Supabase';

export const updateUserData = async (userId, userType, updatedData) => {
    let response;
    try {
        if (userType === 'Recepcionista') {
            response = await supabase
                .from('recepcionista')
                .update(updatedData)
                .eq('recep_id', userId);
        } else if (userType === 'Paciente') {
            response = await supabase
                .from('paciente')
                .update(updatedData)
                .eq('paci_id', userId);
        } else if (userType === 'Medico') {
            response = await supabase
                .from('medico')
                .update(updatedData)
                .eq('medi_id', userId);
        }

        if (response.error) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar os dados do usuário:', error);
        throw error;
    }
};
