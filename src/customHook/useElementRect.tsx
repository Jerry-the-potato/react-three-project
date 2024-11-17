import { useState, useEffect, RefObject } from 'react';

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export default function useElementRect(ref: RefObject<HTMLElement>): Rect {
    const [rect, setRect] = useState<Rect>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const updateRect = () => {
            if (ref.current) {
                const { left, top, width, height } = ref.current.getBoundingClientRect();
                setRect({ left, top, width, height });
            }
        };

        updateRect(); // 初次執行
        window.addEventListener('resize', updateRect); // 窗口尺寸變化時更新

        return () => {
            window.removeEventListener('resize', updateRect); // 清理事件
        };
    }, [ref]);

    return rect;
}