import React, { useRef, useState, useEffect } from "react";
import { Eraser, RotateCcw, PenTool, Sparkles, RefreshCw } from "lucide-react";

interface DrawingCanvasProps {
  onImageGenerated: (dataUrl: string, classHint?: string) => void;
  isLoading: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onImageGenerated, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(14);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize with white background and black stroke (standard dataset format)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save history
    const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-10), currentImgData]);

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = "#111827"; // Dark ink stroke
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStrokeHistory([]);
  };

  const undoLastStroke = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));
    if (strokeHistory.length <= 1) {
      setHasDrawn(false);
    }
  };

  const handlePredict = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onImageGenerated(dataUrl);
  };

  return (
    <div id="drawing-canvas-container" className="flex flex-col gap-4">
      {/* Canvas Frame */}
      <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full rounded-lg cursor-crosshair touch-none bg-white"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <PenTool className="w-6 h-6 stroke-1" />
            <span className="text-xs font-medium text-slate-500">Draw handwritten Amharic character here</span>
            <span className="text-[11px] text-slate-400 font-mono">e.g. ሀ, ለ, ሐ, መ, ሰ</span>
          </div>
        )}
      </div>

      {/* Canvas Controls */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">Stroke:</span>
          <input
            type="range"
            min="6"
            max="26"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-slate-800 cursor-pointer"
          />
          <span className="font-mono text-[11px] text-slate-500">{brushSize}px</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undoLastStroke}
            disabled={strokeHistory.length === 0}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-slate-900 transition"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-1 transition text-xs font-medium"
            title="Clear canvas"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        id="recognize-drawn-button"
        type="button"
        onClick={handlePredict}
        disabled={!hasDrawn || isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Extracting ResNet50 Features & Predicting...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Recognize Drawn Character</span>
          </>
        )}
      </button>
    </div>
  );
};
