import { useSpring } from '@react-spring/web';
import { useState } from 'react'

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export default function useGridToFullscreen(grid: Rect, fullscreen: Rect, gridRefs: any, isHover: boolean, onFinish: Function, PADDING: number = 20){
    const [z, setZ] = useState(0);
    const props = useSpring({
        zIndex: z,
        immediate: (key) => key === 'zIndex', // 對 zIndex 即時生效
        background: 'white',
        position: "relative",
        left: (!isHover ? PADDING : fullscreen.left - grid.left),
        top: (!isHover ? PADDING : fullscreen.top - grid.top + gridRefs.current?.parentNode.scrollTop),
        // position: !isHover ? "" : "fixed",
        // left: !isHover ? grid.left : fullscreen.left,
        // top: !isHover ? grid.top : fullscreen.top,
        width: (!isHover ? grid.width - PADDING * 2: fullscreen.width),
        height: (!isHover ? grid.height - PADDING * 2: fullscreen.height),
        from: {
            width: grid.width - PADDING * 2,
            height: grid.height - PADDING * 2,
        },
        config: { 
            tension: !isHover ? 100 : 30,
            friction: !isHover ? 20 : 10,
        },
        onStart: () => {
            setZ(1);
        },
        onRest: () => {
            // 當動畫結束時觸發
            if(isHover){
                console.log('放大動畫結束！');
            }
            else{
                console.log('縮小動畫結束！' + z);
                setZ(0); // 更新狀態會再次觸發 onRest
            }
            onFinish(); // 更新狀態，表示動畫已結束
        }
    });
    return props;
}