import React, { createContext, useRef, ReactNode, useEffect } from 'react';

// 定義 context 的型別
interface SceneContextType {
    boxesRef: React.MutableRefObject<Float32Array>;
    alphasRef: React.MutableRefObject<Float32Array>;
    colorsRef: React.MutableRefObject<Float32Array>;
    positionsRef: React.MutableRefObject<Float32Array>;
}

// 創建 context
export const SceneContext = createContext<SceneContextType | undefined>(undefined);

interface SceneProviderProps {
    width: number;    // 定義 width 屬性
    height: number;   // 定義 height 屬性
    children: ReactNode; // 定義 children 屬性
}

const defaultColor = [0.18, 0.45, 0.75];
// 封裝 Provider
export const SceneProvider: React.FC<SceneProviderProps> = ({ width, height, children }) => {
    const boxesRef = useRef(new Float32Array(width * height));
    const alphasRef = useRef(new Float32Array(width * height));
    const colorsRef = useRef(new Float32Array(width * height * 3));
    const positionsRef = useRef(new Float32Array(width * height * 3));

    function initial(){
        boxesRef.current = Float32Array.from({ length: width * height }, () => Math.random() * 9 + 1);
        colorsRef.current = new Float32Array(width * height * 3);
        for (let i = 0; i < boxesRef.current.length; i++) {
            colorsRef.current.set([...defaultColor], i * 3);
        }
        alphasRef.current = new Float32Array(width * height).fill(1);
        function getPosition(i : number){
            const x = i % width;
            const y = Math.floor(i / width);
            const z = -boxesRef.current[i]/2;
            return [x, y, z];
        }
        positionsRef.current = new Float32Array(width * height * 3);
        for (let i = 0; i < boxesRef.current.length; i++) {
            positionsRef.current.set(getPosition(i), i * 3); // 設置 x, y, z 的值
        }
    }
    useEffect(() => {
        initial();
    }, [])

    return (
        <SceneContext.Provider value={{ boxesRef, colorsRef, alphasRef, positionsRef }}>
            {children}
        </SceneContext.Provider>
    );
};
