import React, { createContext, useState, useContext } from 'react';

// Criar o contexto
const UserContext = createContext();

// Criar um provedor de contexto
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ id: null, type: '' });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook para usar o contexto
export const useUser = () => {
    return useContext(UserContext);
};
