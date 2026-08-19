import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  PenTool,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Eraser,
  Check,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/amharicData';

interface ImageInputSectionProps {
  currentImageData: string | null;
  onImageSelected: (dataUrl: string, metadata: { name: string; width: number; height: number; sizeKb: number; source: 'upload' | 'draw' | 'preset' }) => void;
  onReset: () => void;
  metadata: { name: string; width: number; height: number; sizeKb: number; source: string } | null;
}

export const ImageInputSection: React.FC<ImageInputSectionProps> = ({
  currentImageData,
  onImageSelected,
  onReset,
  metadata
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'draw' | 'preset'>('preset');
  const [isDragging, setIsDragging] = useState(false);
  const [brushSize, setBrushSize] = useState(14);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sample_ha');

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHasContent, setCanvasHasContent] = useState(false);

  // Initialize Canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasHasContent(false);
  };

  useEffect(() => {
    if (activeMode === 'draw') {
      initCanvas();
    }
  }, [activeMode]);

  // Load default preset on initial mount if no image selected
  useEffect(() => {
    if (!currentImageData) {
      loadPreset(SAMPLE_PRESETS[0]);
    }
  }, []);

  // Handle Preset Selection
  const loadPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    // Draw SVG representation onto an off-screen canvas to get dataUrl
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 224, 224);

    // Draw Amharic character glyph in center
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 120px "Noto Sans Ethiopic", "Abyssinica SIL", "Nyala", "Kefa", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preset.char, 112, 118);

    const dataUrl = canvas.toDataURL('image/png');
    onImageSelected(dataUrl, {
      name: `${preset.name} (${preset.orderName})`,
      width: 224,
      height: 224,
      sizeKb: 14.5,
      source: 'preset'
    });
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      exportCanvas();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A'; // Deep black/slate ink

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setCanvasHasContent(true);
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onImageSelected(dataUrl, {
      name: 'Handwritten Canvas Stroke',
      width: canvas.width,
      height: canvas.height,
      sizeKb: 18.2,
      source: 'draw'
    });
  };

  // File Upload Handlers
  const processUploadedFile = (file: File) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Supported formats: PNG, JPG, JPEG only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected(dataUrl, {
          name: file.name,
          width: img.width,
          height: img.height,
          sizeKb: Math.round((file.size / 1024) * 10) / 10,
          source: 'upload'
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-500" />
          Input Character Source
        </h3>
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveMode('preset')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeMode === 'preset'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Glyphs
          </button>
          <button
            onClick={() => setActiveMode('draw')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeMode === 'draw'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Draw Character
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeMode === 'upload'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Image
          </button>
        </div>
      </div>

      {/* Mode 1: Sample Presets */}
      {activeMode === 'preset' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              Select an authentic handwritten Amharic character glyph:
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              12 Benchmark Samples
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-md'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <span className="text-2xl font-serif font-bold mb-1">{preset.char}</span>
                  <span className="text-[11px] font-semibold truncate max-w-full">{preset.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 truncate max-w-full">{preset.family}</span>
                  {isSelected && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Interactive Stylus / Drawing Canvas */}
      {activeMode === 'draw' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              Draw an Amharic character with distinct strokes:
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Stroke:</span>
              <input
                type="range"
                min="6"
                max="24"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <button
                onClick={initCanvas}
                className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 flex items-center gap-1"
                title="Clear Canvas"
              >
                <RotateCcw className="w-3 h-3 text-red-400" />
                Clear
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative border-2 border-dashed border-slate-700 rounded-lg overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={224}
                height={224}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="cursor-crosshair touch-none"
              />
              {/* Guidelines */}
              <div className="absolute inset-0 pointer-events-none border border-slate-200 opacity-20 grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-slate-400"></div>
                <div className="border-b border-slate-400"></div>
                <div className="border-r border-slate-400"></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Drag & Drop / File Upload */}
      {activeMode === 'upload' && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-amber-500 bg-amber-950/20'
                : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processUploadedFile(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-slate-200">
              Drag and drop handwritten character image here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports <span className="text-slate-300 font-mono">PNG, JPG, JPEG</span> (Max 10MB)
            </p>
            <button
              type="button"
              className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 rounded-md border border-slate-700 shadow-sm"
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Selected Image Metadata & Controls */}
      {currentImageData && metadata && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded border border-slate-700 bg-white p-0.5 overflow-hidden flex-shrink-0">
              <img
                src={currentImageData}
                alt="Selected handwritten character"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-200 truncate max-w-xs sm:max-w-sm font-mono">
                {metadata.name}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Dim: {metadata.width}×{metadata.height}px</span>
                <span>•</span>
                <span>Size: {metadata.sizeKb} KB</span>
                <span>•</span>
                <span className="capitalize text-amber-400 font-medium">Source: {metadata.source}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 rounded-md transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Image
          </button>
        </div>
      )}
    </div>
  );
};
