import * as THREE from 'three'
import { useRef, useState, useEffect, useContext } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'

import Grid from '@mui/material/Grid2';

import { useControls, button, folder } from 'leva'

import { SceneContext, SceneProvider } from './SceneContext'; // 確保導入你的 Context
import Scene from './Scene';
import RecordBtn from './RecordBtn'


  
const width = 100;
const height = 100;

const defaultColor = [0.18, 0.45, 0.75];
const hotpink = [1.0, 0.41, 0.71]; // [255 / 255, 105 / 255, 180 / 255];

let isStop = true;

export default function Dashboard(){
    const boxesRef = useRef(new Float32Array(width * height));
    const alphasRef = useRef(new Float32Array(width * height));
    const colorsRef = useRef(new Float32Array(width * height * 3));
    const positionsRef = useRef(new Float32Array(width * height * 3));
    const [renderCount, setRenderCount] = useState(0);
    function reRender(){
        setRenderCount((prev) => prev + 1);
    }
    function getPosition(i : number){
        const x = i % width;
        const y = Math.floor(i / width);
        const z = -boxesRef.current[i]/2;
        return [x, y, z];
    }

    function initial(){
        boxesRef.current = Float32Array.from({ length: width * height }, () => Math.random() * 9 + 1);
        colorsRef.current = new Float32Array(width * height * 3);
        for (let i = 0; i < boxesRef.current.length; i++) {
            colorsRef.current.set([...defaultColor], i * 3);
        }
        alphasRef.current = new Float32Array(width * height).fill(1);
        positionsRef.current = new Float32Array(width * height * 3);
        for (let i = 0; i < boxesRef.current.length; i++) {
            positionsRef.current.set(getPosition(i), i * 3); // 設置 x, y, z 的值
        }
    }

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef2 = useRef<HTMLCanvasElement | null>(null);
    const canvasRef3 = useRef<HTMLCanvasElement | null>(null);

    const cameraControlsRef1 = useRef<CameraControls>(null);
    const cameraControlsRef2 = useRef<CameraControls>(null);
    const cameraControlsRef3 = useRef<CameraControls>(null);

    function setCamera(){
        if(cameraControlsRef1.current && cameraControlsRef2.current && cameraControlsRef3.current){
            const x = width / 2;
            const y = height / 2;
            cameraControlsRef1.current.setPosition(x, y, 100);
            cameraControlsRef1.current.setTarget(x, y, 0);
            cameraControlsRef2.current.setPosition(x, y, -100);
            cameraControlsRef2.current.setTarget(x, y, 0);
            cameraControlsRef3.current.setPosition(0, 100, -y);
            cameraControlsRef3.current.setTarget(x, 0, y);
        }
        else requestAnimationFrame(setCamera);
    }

    useEffect(() => {
        initial();
        requestAnimationFrame(setCamera);
        return () => {
            console.log("DashBoard disposed");
            cameraControlsRef1.current?.dispose();
            cameraControlsRef2.current?.dispose();
            cameraControlsRef3.current?.dispose();
        }
    }, []);

    const targetIndex = useRef(0);

    function handleClick(index: number = 0){
        targetIndex.current = index;
        const [x, y, z] = getPosition(index);
        // cameraControlsRef1.current?.setPosition(x, y, 100);
        if(isMove1) cameraControlsRef1.current?.setPosition(x + vec1.x, y + vec1.y, - z * 2 + vec1.z, true);
        if(isFollow1) cameraControlsRef1.current?.setTarget(x, y, - z * 2, true);
        if(isMove2) cameraControlsRef2.current?.setPosition(x + vec2.x, y + vec2.y, z + vec2.z, true);
        if(isFollow2) cameraControlsRef2.current?.setTarget(x, y, z, true);
        if(isMove3) cameraControlsRef3.current?.setPosition(x + vec3.x, - z * 2 + vec3.z, y + vec3.y, true);
        if(isFollow3) cameraControlsRef3.current?.setTarget(x, - z * 2, y, true); // 'XZY'
    }

    // const [colorState, setColorState] = useState(colorsRef.current);
    // const [alphaState, setAlphaState] = useState(alphasRef.current);
    // const [positionState, setPositionState] = useState(positionsRef.current);
    // // const [hoverState, setHoverState] = useState<number | undefined>(undefined);
    // const sceneProps = {width, height, colorState, setColorState, alphaState, setAlphaState, positionState, setPositionState, handleClick};
    const sceneProps = {width, height, boxesRef, colorsRef, alphasRef, positionsRef, reRender, handleClick};
    const { 
        minDistance, enabled, verticalDragToForward, dollyToCursor, infinityDolly,
        isMove1, isFollow1, isMove2, isFollow2, isMove3, isFollow3, vec1, vec2, vec3
     } = useControls({
        // setTarget: folder(
        //   {
        //     vec3: { value: [3, 0, -3], label: 'vec' },
        //     'setTarget(…vec)': button((get) => {
        //         const vec3 = get('setTarget.vec3') as [number, number, number]
        //         cameraControlsRef1.current?.setTarget(...vec3, true)
        //     })
        //   },
        //   { collapsed: true }
        // ),
        // setLookAt: folder(
        //   {
        //     vec4: { value: [width, height, 100], label: 'position' },
        //     vec5: { value: [100, 100, 0], label: 'target' },
        //     'setLookAt(…position, …target)': button((get) => {
        //         const vec4 = get('setTarget.vec3') as [number, number, number];
        //         const vec5 = get('setTarget.vec3') as [number, number, number];
        //         cameraControlsRef1.current?.setLookAt(...vec4, ...vec5, true);
        //     })
        //   },
        //   { collapsed: true }
        // ),
        
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

    return <>

        <SceneProvider width={100} height={100}>
            <Grid container>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 6, xl: 4}}
                    sx={{
                        height: 500,
                        p: 2,
                        bgcolor: 'grey.100',
                        '&:hover': {
                            bgcolor: 'grey.200',
                        },
                    }}
                >
                    <Canvas ref={canvasRef}>
                        <CameraControls
                            ref={cameraControlsRef1}
                            minDistance={minDistance}
                            enabled={enabled}
                            verticalDragToForward={verticalDragToForward}
                            dollyToCursor={dollyToCursor}
                            infinityDolly={infinityDolly}
                        />
                        <ambientLight intensity={Math.PI / 2} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                        <Scene {...sceneProps} order='XYZ'/>
                    </Canvas>
                </Grid>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 6, xl: 4}}
                    sx={{
                        width: 1/2,
                        height: 500,
                        p: 2,
                        bgcolor: 'grey.100',
                        '&:hover': {
                            bgcolor: 'grey.200',
                        },
                    }}>
                    <Canvas ref={canvasRef2}>
                        <CameraControls ref={cameraControlsRef2}/>
                        <Scene {...sceneProps} order='XYZ'/>
                    </Canvas>
                </Grid>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 12, xl: 4}}
                    sx={{
                        width: 1,
                        height: 500,
                        p: 2,
                        bgcolor: 'grey.100',
                        '&:hover': {
                            bgcolor: 'grey.200',
                        },
                    }}>
                    <Canvas ref={canvasRef3}>
                        <CameraControls ref={cameraControlsRef3}/>
                        <Scene {...sceneProps} order='XZY'/>
                    </Canvas>
                </Grid>
                <Grid 
                    size={{xs: 12, sm: 12, md: 12, lg: 12, xl: 4}}
                >
                    <RecordBtn ref={recordBtnRef} canvas={[canvasRef, canvasRef2, canvasRef3]}/>
                </Grid>
            </Grid>
        </SceneProvider>
    </> 
}