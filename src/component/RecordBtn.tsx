import { useImperativeHandle, forwardRef, useState } from 'react';
import downloadMedia from '../js/downloadMedia';
import { Button } from '@mui/material';
interface RecordBtnProps {
    canvas: React.RefObject<HTMLCanvasElement>[]; // 陣列，包含多個 canvas 的參考
    audio?: React.RefObject<HTMLAudioElement>; // 單個 audio 的參考
}
interface ButtonHandle {
    handleRecord: () => void;
}

const media: { [key: string]: any } = {}

const RecordBtn = forwardRef<ButtonHandle, RecordBtnProps>(({canvas, audio}, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    // 有必要時從外部調用錄影方法
    useImperativeHandle(ref, () => ({ handleRecord }));

    function handleRecord(){
        setIsRecording(!isRecording);

        if(isRecording){
            media.recorder.stop();
            return;
        }
        const chunks: Blob[] = [];
        // const mergedCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
        // const mergedContext = mergedCanvasRef.current.getContext('2d');
        const mergedCanvas = document.createElement('canvas');
        const mergedContext = mergedCanvas.getContext('2d');

        const widths = canvas.map(canvasRef => canvasRef.current?.width || 0);
        const heights = canvas.map(canvasRef => canvasRef.current?.height || 0);
        const maxWidth = Math.max(...widths);
        const maxHeight = Math.max(...heights);
        const column = 1 + Math.floor(Math.sqrt(canvas.length - 1));
        const row = Math.ceil(Math.sqrt(canvas.length - 1));

        // mergedCanvas.width = maxWidth * column;
        // mergedCanvas.height = maxHeight * row;

        mergedCanvas.width = maxWidth * canvas.length;
        mergedCanvas.height = maxHeight;

        const drawFrames = () => {
            // 清空合併畫布
            mergedContext?.clearRect(0, 0, mergedCanvas.width, mergedCanvas.height);
            
            // 將每個 canvas 的內容繪製到合併畫布
            canvas.forEach((canvasRef, index) => {
                if(canvasRef.current){
                    const w = index % column;
                    const h = Math.floor(index / column);
                    // mergedContext?.drawImage(canvasRef.current, w * maxWidth, h * maxHeight, maxWidth, maxHeight);
                    mergedContext?.drawImage(canvasRef.current, index * maxWidth, 0, maxWidth, maxHeight);
                }
            });

            requestAnimationFrame(drawFrames);
        };
        requestAnimationFrame(drawFrames);

        media.canvas = mergedCanvas;
        media.stream = media.canvas.captureStream(60); // fps
        if(audio?.current){
            media.audio = audio.current;
            media.audio.play();
            media.audioStream = media.audio.captureStream();
            media.stream = new MediaStream([...media.stream.getVideoTracks(), ...media.audioStream.getAudioTracks()]);
        }
        media.recorder = new MediaRecorder(media.stream, { mimeType: "video/mp4; codecs=vp9" })
        media.recorder.ondataavailable = (evt: BlobEvent) => { chunks.push(evt.data); };
        // Provide recorded data when recording stops
        media.recorder.onstop = () => {downloadMedia(chunks);};
        media.recorder.start(1000);
    }

    return (
        <Button onClick={handleRecord}>{isRecording ? "停止錄影" : "開始錄影"}</Button>
    )
});
export default RecordBtn;