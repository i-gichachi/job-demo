import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        userType: null,
        username: null,
    });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};