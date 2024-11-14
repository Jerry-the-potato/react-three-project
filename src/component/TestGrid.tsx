import Grid from '@mui/material/Grid2';

import { Context, Provider } from './TestContext'; // 確保導入你的 Context
import { useSpring, animated } from '@react-spring/web';
import React, { useContext, useEffect, useRef, useState } from 'react';

interface refProp{
    ref1: React.RefObject<HTMLElement>;
    ref2: React.RefObject<HTMLElement>;
}

export default function TestGrid(){
    const [hovered, setHovered] = useState(false);
    const [animationFinished, setAnimationFinished] = useState(false); // 用來紀錄動畫是否結束
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState<{ left: number; top: number; width: number; height: number }>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    });
    const [dimensions2, setDimensions2] = useState<{ left: number; top: number; width: number; height: number }>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    });
    
    useEffect(() => {
        const handleResize = () => {
            {
                const {left, top, width, height} = ref1.current?.getBoundingClientRect()!;
                setDimensions({ left, top, width, height });
            }
            {
                const {left, top, width, height} = ref2.current?.getBoundingClientRect()!;
                setDimensions2({ left, top, width, height });
            }
        }
        handleResize(); // 首次執行，獲取當前尺寸
        window.addEventListener('resize', handleResize); // 確保尺寸在變動時也能更新

        return () => {
            window.removeEventListener('resize', handleResize); // 清理事件監聽
        };

    },[])
    const props = useSpring({
        position: "relative",
        background: 'white',
        border: "2px solid black",
        left: !hovered ? 0 : dimensions2.left - dimensions.left,
        top: !hovered ? 0 : dimensions2.top - dimensions.top,
        width: !hovered ? dimensions2.width : dimensions.width,
        height: !hovered ? dimensions2.height : dimensions.height,
        from: {
            left: 0, // 初始值從 dimensions2
            top: 0,
            width: dimensions2.width,
            height: dimensions2.height,
        },
        config: { duration: 1000 },
        onRest: () => {
            // 當動畫結束時觸發
            if(hovered)
            console.log('放大動畫結束！');
            else
            console.log('縮小動畫結束！');
            setAnimationFinished(true); // 更新狀態，表示動畫已結束
        },
      });
    return <>
        <Provider>
            <Grid container ref={ref1}>
                <Grid ref={ref2}
                    size={{xs: 12, sm: 12, md: 12, lg: 6, xl: 4}}
                    sx={{
                        height: 500,
                        bgcolor: 'grey.100',
                        '&:hover': {
                            bgcolor: 'grey.600',
                        },
                    }}
                >
                    <animated.div style={props}
                        onClick={() => setHovered(true)}  // 觸發 hover
                        onMouseLeave={() => setHovered(false)} // 觸發離開 hover
                    >這是逐漸顯示的內容</animated.div>
                </Grid>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 6, xl: 4}}
                    sx={{
                        width: 1/2,
                        height: 500,
                        p: 2,
                        bgcolor: 'grey.200',
                        '&:hover': {
                            bgcolor: 'grey.500',
                        },
                    }}>
                </Grid>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 12, xl: 4}}
                    sx={{
                        width: 1,
                        height: 500,
                        p: 2,
                        bgcolor: 'grey.300',
                        '&:hover': {
                            bgcolor: 'grey.400',
                        },
                    }}>
                </Grid>
            </Grid>
        </Provider>
    </> 
}