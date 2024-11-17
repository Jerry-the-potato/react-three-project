import Grid from '@mui/material/Grid2';

import { Context, Provider } from './TestContext'; // 確保導入你的 Context
import { useSpring, animated } from '@react-spring/web';

import React, { useContext, useEffect, useRef, useState } from 'react';

import useElementRect from '../customHook/useElementRect';
import useGridToFullscreen from '../customHook/useGridToFullscreen';

import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'

import { useControls, button, folder } from 'leva'
import productImage from '@/assets/產品.jpg';
import RecordBtn from './RecordBtn'
import Scene from './Scene';

let isStop = true;
let width = 100, height = 100;
function useImage(imageSrc: string){
    const boxesRef = useRef(new Float32Array());
    const alphasRef = useRef(new Float32Array());
    const colorsRef = useRef(new Float32Array());
    const positionsRef = useRef(new Float32Array());
    function getPosition(i : number){
        const x = i % width;
        const y = -Math.floor(i / height);
        const z = -boxesRef.current[i]/2;
        return [x, y, z];
    }
    useEffect(() => {
        const image = new Image();
        image.onload = () => {
            // 創建 canvas 和 2D 上下文
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 設定畫布大小為圖片的大小
            canvas.width = image.width;
            canvas.height = image.height;
            
            // 將圖片繪製到畫布上
            ctx?.drawImage(image, 0, 0);
            
            // 獲取畫布的像素數據
            const imageData = ctx?.getImageData(0, 0, image.width, image.height);

            if (!imageData) {
                console.error('Failed to get image data');
                return; // 或者進行其他錯誤處理
            }

            const data = imageData?.data; // 獲取 RGBA 數據 (每四個值為一個像素：r, g, b, a)
            
            // 灰階處理：將 RGB 轉換為灰度值，並填充到 colorsRef
            function getGap(width: number, height: number){
                const maxPixel = 128;
                const max = Math.max(width, height);
                for(let i = Math.floor(max / maxPixel); i < max; i++){
                    if(width % i == 0){
                        return i;
                    }
                }
            }
            const gap = getGap(image.width, image.height) ?? 1;
            const w = Math.floor(image.width / gap);
            const h = Math.floor(image.height / gap);
            console.log(w, h);
            width = w;
            height = h;
            boxesRef.current = new Float32Array(w * h);
            colorsRef.current = new Float32Array(w * h * 3);
            alphasRef.current = new Float32Array(w * h).fill(1);
            positionsRef.current = new Float32Array(w * h * 3);

            for (let i = 0; i < w * h; i++) {
                const x = (i % w) * gap; // 依照新的寬度計算 x 座標
                const y = Math.floor(i / w) * gap; // 依照新的高度計算 y 座標        
                const pixelIndex = (y * image.width + x) * 4; // 每個像素有 4 個值 (r, g, b, a)
                const r = data[pixelIndex] ?? 0; // 紅色值
                const g = data[pixelIndex + 1] ?? 0; // 綠色值
                const b = data[pixelIndex + 2] ?? 0; // 藍色值
                
                // 計算灰度值 (用公式轉換 RGB 為灰度)
                const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                
                // 把灰度值填入 colorsRef (使用灰度值填充 RGB)
                // colorsRef.current.set([gray / 255, gray / 255, gray / 255], i * 3);
                colorsRef.current.set([r / 255, g / 255, b / 255], i * 3);
                
                // 用來填充 boxesRef 的邏輯 (這裡我們可以根據灰度值來設置箱子的大小)
                boxesRef.current[i] = gray / 255 * 9 + 1; // 根據灰度值設置大小
            }
            for (let i = 0; i < boxesRef.current.length; i++) {
                positionsRef.current.set(getPosition(i), i * 3); // 設置 x, y, z 的值
            }
        }
        image.src = imageSrc; // 替換為你的圖片路徑
    }, []);
    return [boxesRef, alphasRef, colorsRef, positionsRef];
}

export default function TestGrid(){
    const [hoverStates, setHoverStates] = useState([false, false, false, false]);
    const gridRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const rects = gridRefs.map((ref) => useElementRect(ref));
    
    const [isCarousel, setIsCarousel] = useState(false);
    
    const handleHover = (index: number, isHover: boolean) => {
        setHoverStates((prev) =>
            prev.map((hover, i) => (i === index ? isHover : hover))
        );
    };

    const gridItems = [
        { id: 'grid1', size: { xs: 12, sm: 12, md: 12, lg: 6, xl: 4 }, bgcolor: 'grey.100', hoverColor: 'grey.600', order: 'XYZ' },
        { id: 'grid2', size: { xs: 12, sm: 12, md: 12, lg: 6, xl: 4 }, bgcolor: 'grey.200', hoverColor: 'grey.500', order: 'XYZ' },
        { id: 'grid3', size: { xs: 12, sm: 12, md: 12, lg: 12, xl: 4 }, bgcolor: 'grey.300', hoverColor: 'grey.400', order: 'XZY' },
    ];

    const props = gridItems.map((item, index) => {
        const fullscreen = rects[0];
        const grid = rects[index + 1];
        const isHover = hoverStates[index + 1];
        const onFinish = () => {
            setIsCarousel(true); // 動畫結束後切換到輪播器
        };
        return useGridToFullscreen(grid, fullscreen, gridRefs[0], isHover, onFinish);
    });

    const canvasRefs = Array.from({ length: 3 }, () => useRef<HTMLCanvasElement>(null));
    const cameraControlsRefs = Array.from({ length: 3 }, () => useRef<CameraControls>(null));
    const [boxesRef, alphasRef, colorsRef, positionsRef] = useImage(productImage);
    const [renderCount, setRenderCount] = useState(0);
    function reRender(){
        setRenderCount((prev) => prev + 1);
    }

    function getPosition(i : number){
        const x = i % width;
        const y = -Math.floor(i / height);
        const z = -boxesRef.current[i]/2;
        return [x, y, z];
    }

    const { 
        minDistance, enabled, verticalDragToForward, dollyToCursor, infinityDolly,
        isMove1, isFollow1, isMove2, isFollow2, isMove3, isFollow3, vec1, vec2, vec3
     } = useControls({
        minDistance: { value: 0 },
        運鏡設定: folder({
            鏡頭1: folder(
                {
                    vec1: { value: {x: 0, y: 0, z: 20}, label: '相對位置' },
                    isMove1: { value: true, label: '啟用位置' },
                    isFollow1: { value: true, label: '目標跟隨' },
                },
                { collapsed: false }
            ),
            鏡頭2: folder(
                {
                    vec2: { value: {x: 0, y: 0, z: -20}, label: '相對位置' },
                    isMove2: { value: true, label: '啟用位置' },
                    isFollow2: { value: true, label: '目標跟隨' }
                },
                { collapsed: true }
            ),
            鏡頭3: folder(
                {
                    vec3: { value: {x: 10, y: 10, z: 20}, label: '相對位置' },
                    isMove3: { value: true, label: '啟用位置' },
                    isFollow3: { value: true, label: '目標跟隨' }
                },
                { collapsed: true }
            ),
        }, { collapsed: true }),
        相機設定: folder(
            {
                enabled: { value: true, label: 'Controls On' },
                dollyToCursor: { value: true, label: 'Dol. Cursor' },
                verticalDragToForward: { value: false, label: 'Drag Fwd' },
                infinityDolly: { value: false, label: 'Inf. Dolly' }
            },
            { collapsed: true }
        ),
        isRecording: { 
            value: false, 
            label: '一鍵錄影',
            onChange: (value: boolean) => {
                // 初次渲染會呼叫兩次並不穩定
                if(isStop){
                    requestAnimationFrame(() => isStop = false);
                    return;
                }
                // 在這裡調用 RecordBtn 的 handleClick 來處理錄影
                recordBtnRef.current?.handleRecord(); // 一個對 RecordBtn 的引用
            }
        }

    })

    const recordBtnRef = useRef<{ handleRecord: () => void }>(null);

    function setCamera(){
        if (cameraControlsRefs.every(ref => ref.current)) { // 確保所有的 refs 都已經被初始化
            const x = width / 2;
            const y = -height / 2;
            
            // 使用迴圈設置所有相機的位置和目標
            cameraControlsRefs[0].current?.setPosition(x, y, 100);
            cameraControlsRefs[0].current?.setTarget(x, y, 0);
    
            cameraControlsRefs[1].current?.setPosition(x, y, -100);
            cameraControlsRefs[1].current?.setTarget(x, y, 0);
    
            cameraControlsRefs[2].current?.setPosition(0, 100, -y);
            cameraControlsRefs[2].current?.setTarget(x, 0, y);
        } else {
            requestAnimationFrame(setCamera); // 若某些 ref 尚未初始化，重試
        }
    }
    useEffect(() => {
        requestAnimationFrame(setCamera);
        return () => {
            console.log("DashBoard disposed");
            cameraControlsRefs.forEach((ref) => {
                ref.current?.dispose();
            })
        }
    }, []);
    const targetIndex = useRef(0);
    function handleClick(index: number = 0){
        targetIndex.current = index;
        const [x, y, z] = getPosition(index);
        const vecs = [
            { id: 'camera1', position: [x + vec1.x, y + vec1.y, - z * 2 + vec1.z], target: [x, y, - z * 2] },
            { id: 'camera2', position: [x + vec2.x, y + vec2.y, z + vec2.z], target: [x, y, z] },
            { id: 'camera3', position: [x + vec3.x, - z * 2 + vec3.z, y + vec3.y], target: [x, - z * 2, y] }, // 'XZY'
        ]
        vecs.forEach((vec, index) => {
            cameraControlsRefs[index].current?.setPosition(...(vec.position as [number, number, number]), true);
            cameraControlsRefs[index].current?.setTarget(...(vec.target as [number, number, number]), true);
        })
        // if(isMove1) cameraControlsRefs[1].current?.setPosition(x + vec1.x, y + vec1.y, - z * 2 + vec1.z, true);
        // if(isFollow1) cameraControlsRefs[1].current?.setTarget(x, y, - z * 2, true);
        // if(isMove2) cameraControlsRefs[2].current?.setPosition(x + vec2.x, y + vec2.y, z + vec2.z, true);
        // if(isFollow2) cameraControlsRefs[2].current?.setTarget(x, y, z, true);
        // if(isMove3) cameraControlsRefs[3].current?.setPosition(x + vec3.x, - z * 2 + vec3.z, y + vec3.y, true);
        // if(isFollow3) cameraControlsRefs[3].current?.setTarget(x, - z * 2, y, true); // 'XZY'
    }
    const sceneProps = {width, height, boxesRef, colorsRef, alphasRef, positionsRef, reRender, handleClick};

    return <>
        <Provider>

            {true && <Grid container ref={gridRefs[0]} sx={{
                width: '100%',  // 最大寬度
                height: '100%',  // 最大高度
            }}>
                {gridItems.map((item, index) => {
                    return (
                        <Grid
                            ref={gridRefs[index + 1]}
                            key={item.id}
                            size={item.size}
                            sx={{
                                height: 500,
                                bgcolor: item.bgcolor,
                                '&:hover': {
                                    bgcolor: item.hoverColor,
                                },
                            }}
                        >
                            <animated.div
                                style={props[index]}
                                onClick={() => handleHover(index + 1, true)}
                                onMouseLeave={() => handleHover(index + 1, false)}
                            >
                                <Canvas ref={canvasRefs[index]}
                                    onCreated={({ gl }) => {
                                        gl.setClearColor(0xeeeeee); // 設置淺藍色背景
                                    }}
                                >
                                    <CameraControls
                                        ref={cameraControlsRefs[index]}
                                        minDistance={minDistance}
                                        enabled={enabled}
                                        verticalDragToForward={verticalDragToForward}
                                        dollyToCursor={dollyToCursor}
                                        infinityDolly={infinityDolly}
                                    />
                                    <Scene {...sceneProps} order={item.order}/>
                                </Canvas>
                            </animated.div>
                        </Grid>
                    );
                })}
            </Grid>}
            {/* {isCarousel && <div style={{ display: "flex", overflowX: "auto", width: "100%", height: "500px" }}>
                {gridItems.map((item, index) => (
                    <div
                        key={item.id}
                        style={{
                            minWidth: "100%",
                            height: "100%",
                            backgroundColor: item.bgcolor,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "2rem",
                            color: "#000",
                        }}
                    >
                        <Canvas ref={canvasRefs[index]}
                            onCreated={({ gl }) => {
                                gl.setClearColor(0xeeeeee); // 設置淺藍色背景
                            }}
                        >
                            <CameraControls
                                ref={cameraControlsRefs[index]}
                                minDistance={minDistance}
                                enabled={enabled}
                                verticalDragToForward={verticalDragToForward}
                                dollyToCursor={dollyToCursor}
                                infinityDolly={infinityDolly}
                            />
                            <Scene {...sceneProps} order={item.order}/>
                        </Canvas>
                    </div>
                ))}
            </div>} */}
        </Provider>
    </> 
}