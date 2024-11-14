import React, { createContext, useRef, ReactNode, useState } from 'react';

// 定義 context 的型別
interface contextType {
    value: string;
}

// 創建 context
export const Context = createContext<contextType | undefined>(undefined);

interface providerProps {
    children: ReactNode; // 定義 children 屬性
}

const defaultColor = [0.18, 0.45, 0.75];
// 封裝 Provider
export const Provider: React.FC<providerProps> = ({ children }) => {
    const [value, setValue] = useState('default value');
    return (
        <Context.Provider value={{ value }}>
            {children}
        </Context.Provider>
    );
};
