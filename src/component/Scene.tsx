import * as THREE from 'three'
import { useRef, useState, useEffect, useContext } from 'react'

import { Path } from '../js/path.js'
import { SceneContext, SceneProvider } from './SceneContext'; // 確保導入你的 Context

import { extend, useFrame } from '@react-three/fiber'
import getShaderMaterial from '../js/shader.ts'

const BoxShaderMaterialXYZ = getShaderMaterial('XYZ');
const BoxShaderMaterialXZY = getShaderMaterial('XZY');

extend({ BoxShaderMaterialXYZ, BoxShaderMaterialXZY})

// 擴展 JSX intrinsic elements
declare global {
    namespace JSX {
        interface IntrinsicElements {
            boxShaderMaterialXYZ: any; // 或者定義更精確的類型
            boxShaderMaterialXZY: any;
        }
    }
}

// interface SceneProps {
//     width: number;
//     height: number;
//     colorState: Float32Array;
//     setColorState: React.Dispatch<React.SetStateAction<Float32Array>>;
//     alphaState: Float32Array;
//     setAlphaState: React.Dispatch<React.SetStateAction<Float32Array>>;
//     positionState: Float32Array; 
//     setPositionState: React.Dispatch<React.SetStateAction<Float32Array>>;
//     order: string;
//     handleClick: Function;
// }

interface SceneProps {
    width: number;
    height: number;
    boxesRef: React.MutableRefObject<Float32Array>;
    alphasRef: React.MutableRefObject<Float32Array>;
    colorsRef: React.MutableRefObject<Float32Array>;
    positionsRef: React.MutableRefObject<Float32Array>;
    order: string;
    reRender: () => void;
    handleClick: (index: number) => void;
}

// const hover = new Array(width * height);

const defaultColor = [0.18, 0.45, 0.75];
const hotpink = [1.0, 0.41, 0.71]; // [255 / 255, 105 / 255, 180 / 255];

let isFirst = true;
let isDown = false;
let hoverIndex = -1;


export default function Scene(props: SceneProps) {
    // const {width, height, colorState, setColorState, alphaState, setAlphaState, positionState, setPositionState, order, handleClick} = {...props}
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    
    const material = {
        'renderByXYZ': <boxShaderMaterialXYZ transparent ref={materialRef} />,
        'renderByXZY': <boxShaderMaterialXZY transparent ref={materialRef} />
    }
    const {width, height, boxesRef, colorsRef, alphasRef, positionsRef, reRender, handleClick, order} = {...props}
    const initialColorsRef = useRef<Float32Array>(colorsRef.current.slice());

    useFrame((state) => {
        if(materialRef.current){
            materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
            // materialRef.current.uniformsNeedUpdate = true;
            // reRender();
        }
    });
    // const { boxesRef, colorsRef, alphasRef, positionsRef } = useContext(SceneContext);
    const pathRef = useRef<any>({});



    // 此為共用屬性，要移到父元件
    const pathIndex = useRef<number>(0); 
    function getPosition(i : number){
        const x = i % width;
        const y = -Math.floor(i / width);
        const z = -boxesRef.current[i]/2;
        return [x, y, z];
    }
    // 不影響渲染，但影響該物體的可視點和 hover 區域
    function hoverPosition(){
        if(meshRef.current){
            const tempObject = new THREE.Object3D()
            for (let i = 0; i < width * height; i++) {
                const [x, y, z] = getPosition(i);
                switch(order){
                    case 'XZY':
                        tempObject.scale.set(0.8, z * 2, 0.8);
                        tempObject.position.set(x, -z, y);
                        break;
                    case 'XYZ':
                    default:
                        tempObject.scale.set(0.8, 0.8, z * 2);
                        tempObject.position.set(x, y, z);
                }
                tempObject.updateMatrix();
                meshRef.current?.setMatrixAt(i, tempObject.matrix);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
        else requestAnimationFrame(hoverPosition);
    }
    useEffect(()=>{
        hoverPosition();
        return () => {
            console.log("Scene disposed.");
            meshRef.current?.geometry.dispose();
        };
    }, [])
    return (
        <instancedMesh 
            ref={meshRef} 
            args={[undefined, undefined, width * height]}
            onPointerMove={(e) => {
                const index = e.instanceId!; // 獲取 index 值
                const newColors = new Float32Array(colorsRef.current);
                const hotpink = initialColorsRef.current.slice(index * 3, index * 3 + 3).map((v) => 1-v);
                newColors.set([...hotpink], index * 3);
                colorsRef.current = newColors;
                reRender();
                // hoverIndex = index;
                isDown = false;
            }}
            onPointerOut={(e) => {
                const index = e.instanceId!; // 獲取 index 值
                const newColors = new Float32Array(colorsRef.current);
                const initialColor = initialColorsRef.current.slice(index * 3, index * 3 + 3);
                newColors.set(initialColor, index * 3);
                colorsRef.current = newColors;
                reRender();
                // if(hoverIndex == index) hoverIndex = -1;
            }}
            onPointerDown={() => {
                isDown = true;
                // requestAnimationFrame(()=> isDown = false);
            }}
            onPointerUp={(e) => {
                if(isDown == false) return;
                if(isFirst == false) return;

                const index = e.instanceId!;
                // // colorsRef.current.set([...hotpink], index * 3);
                // setPositionState(newPositions);
                handleClick(index);
                const [x, y, z] = getPosition(index);

                // 管理動畫
                const lastIndex = pathIndex.current;
                const lastPath = pathRef.current[lastIndex];
                lastPath?.newTarget(x, y, z, 30);
                lastPath?.registerDispose(() => {
                    delete pathRef.current[lastIndex]}
                );
                
                pathIndex.current++;
                if(pathIndex.current >= 60) pathIndex.current = 0;

                const path = new Path(x, y, z, (px: number, py: number, pz: number) => {
                    const newPositions = new Float32Array(positionsRef.current);
                    newPositions.set([pz], index * 3 + 2);
                    positionsRef.current = newPositions;
                    reRender();
                })
                path.newTarget(x, y, z - 10, 30);
                pathRef.current[pathIndex.current] = path;
                
                // const newAlphas = new Float32Array(width * height).fill(0.5);
                // newAlphas[index] = 1.0;
                // setAlphaState(newAlphas);
                alphasRef.current = new Float32Array(width * height).fill(0.5);
                alphasRef.current[index] = 1.0;
                // reRender();
                isFirst = false;
                requestAnimationFrame(()=> isFirst = true);
            }}
            >
            <boxGeometry args={[1, 1, 1]}>
                <instancedBufferAttribute attach="attributes-height" args={[boxesRef.current, 1]} />
                <instancedBufferAttribute attach="attributes-color" args={[colorsRef.current, 3]} />
                <instancedBufferAttribute attach="attributes-alpha" args={[alphasRef.current, 1]} />
                <instancedBufferAttribute attach="attributes-offset" args={[positionsRef.current, 3]} />
            </boxGeometry>
            {material['renderBy' + order as keyof typeof material]}
        </instancedMesh>
    );
}