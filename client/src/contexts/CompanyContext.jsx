import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
    // True = GST Company (Premium Catering), False = Non-GST (Cash Ledger)
    const [isGstEntity, setIsGstEntity] = useState(true);

    const toggleEntity = () => {
        setIsGstEntity(prev => !prev);
    };

    return (
        <CompanyContext.Provider value={{ isGstEntity, toggleEntity }}>
            {children}
        </CompanyContext.Provider>
    );
};
