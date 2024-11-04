
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

// 定義 GLSL 著色器
const vertexShader : {[key: string]: string} = {
    renderByXYZ: `
        transformed = position;
        transformed.x *= 0.8;
        transformed.y *= 0.8;
        transformed.z *= height;  // 按照高度屬性縮放
        transformed += offset;`,
    renderByXZY: `
        transformed = position;
        transformed.x *= 0.8;
        transformed.z *= 0.8;
        transformed.y *= height;  // 按照高度屬性縮放
        transformed.x += offset.x;
        transformed.z += offset.y; // y 輸入 z
        transformed.y += -offset.z; // z 輸入 y，負值：反轉鏡像世界`
}

const fragmentShader : {[key: string]: string} = {
    renderByXYZ: `
        float edgeConditionX = step(abs(fract(transformed.x) - 0.5), borderWidth + 0.1); // 在頂點著色器變小 0.8
        float edgeConditionY = step(abs(fract(transformed.y) - 0.5), borderWidth + 0.1);
        float edgeConditionZ = step(abs(transformed.z), borderWidth) + 1.0 - step(abs(transformed.z), vHeight - borderWidth);`,
    renderByXZY: `
        float edgeConditionX = step(abs(fract(transformed.x) - 0.5), borderWidth + 0.1);
        float edgeConditionZ = step(abs(fract(transformed.z) - 0.5), borderWidth + 0.1);
        float edgeConditionY = step(abs(transformed.y), borderWidth) + 1.0 - step(abs(transformed.y), vHeight - borderWidth);`
}

export default function getShaderMaterial(order: string = 'XYZ'){
    return shaderMaterial(
        { time: 0, scale: new THREE.Vector3()},
        ` 
        attribute float height;
        attribute vec3 offset;
        attribute vec3 color; // 新增顏色屬性
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vHeight;
        varying vec3 transformed;
        void main() {
        ` + vertexShader['renderBy' + order] +
        `
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        vColor = color; // 傳遞顏色
        vAlpha = alpha; // 透明度
        vHeight = height; // 高度
        }`,
        `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vHeight;
        varying vec3 transformed;
        void main() {

            vec3 lightDir = normalize(vec3(30.0, 30.0, 100.0) - transformed);
            float diff = max(dot(vec3(-1.0, -1.0, 1.0), lightDir), 0.0);
            vec3 lightDir2 = normalize(vec3(30.0, 100.0, 30.0) - transformed);
            float diff2 = max(dot(vec3(1.0, 1.0, 1.0), lightDir2), 0.0);
            vec3 baseColor = vColor * (diff + diff2); // 使用實例顏色

            vec3 edgeColor = (vColor - 0.3) * (diff + diff2);
            // 定義邊框寬度
            float borderWidth = 0.05; 
            vec3 pos = gl_FragCoord.xyz;

            // 計算是否在邊框外部
        ` + fragmentShader['renderBy' + order] +
        `
            // 計算每對維度的邊緣
            float isEdgeXY = edgeConditionX * edgeConditionY; // X 和 Y 平面的邊緣
            float isEdgeXZ = edgeConditionX * edgeConditionZ; // X 和 Z 平面的邊緣
            float isEdgeYZ = edgeConditionY * edgeConditionZ; // Y 和 Z 平面的邊緣

            // 結合所有邊緣條件
            float isEdge = max(max(isEdgeXY, isEdgeXZ), isEdgeYZ); // 取最大值以判斷是否為邊緣
            
            gl_FragColor = vec4(mix(vColor, vColor-0.3, isEdge), mix(vAlpha, vAlpha - 0.2, isEdge));
        }
        `
    )
}