import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
  RotateCw,
  Move,
  ZoomIn
} from 'lucide-react';
import { PreprocessingResult } from '../types';

interface PreprocessingPageProps {
  currentImageData: string | null;
  imageMeta: { name: string; width: number; height: number; sizeKb: number } | null;
}

export const PreprocessingPage: React.FC<PreprocessingPageProps> = ({
  currentImageData,
  imageMeta
}) => {
  const [preprocessingResult, setPreprocessingResult] = useState<PreprocessingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Augmentation playground states
  const [rotAngle, setRotAngle] = useState(10);
  const [shiftX, setShiftX] = useState(5);
  const [shiftY, setShiftY] = useState(-5);
  const [zoomScale, setZoomScale] = useState(1.05);

  const fetchPreprocessing = async () => {
    if (!currentImageData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: currentImageData, targetDim: 224 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to preprocess image');
      setPreprocessingResult(data.preprocessing);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing preprocessing pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentImageData) {
      fetchPreprocessing();
    }
  }, [currentImageData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 font-semibold tracking-wider uppercase mb-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Image Preprocessing & Augmentation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          PREPROCESSING PIPELINE
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Transforms raw handwritten character images through grayscale conversion, 3x3 median noise filtering, Otsu adaptive thresholding, glyph auto-centering, 224×224 bilinear resizing, and ImageNet standardization.
        </p>
      </div>

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-300">
            Executing mathematical preprocessing pipeline on character pixels...
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {!loading && !preprocessingResult && !currentImageData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-base font-semibold text-slate-200">No Image Loaded</p>
          <p className="text-xs text-slate-400 mt-1">
            Please select or upload a character on the Recognition tab to inspect its preprocessing transformations.
          </p>
        </div>
      )}

      {!loading && preprocessingResult && (
        <div className="space-y-8">
          {/* Visual Transformation Stepper Stages */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Step-by-Step Visual Transformation Pipeline
              </h3>
              <button
                onClick={fetchPreprocessing}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" /> Re-run
              </button>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Stage 1: Original */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>Original Image</span>
                </div>
                <div className="w-36 h-36 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentImageData || ''}
                    alt="Original handwritten character"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {preprocessingResult.originalWidth} × {preprocessingResult.originalHeight} px (RGB)
                </div>
              </div>

              {/* Stage 2: Grayscale */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>Grayscale Conversion</span>
                </div>
                <div className="w-36 h-36 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={preprocessingResult.grayscaleImage}
                    alt="Grayscale transformed character"
                    className="w-full h-full object-contain filter grayscale"
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  0.299R + 0.587G + 0.114B
                </div>
              </div>

              {/* Stage 3: Noise Removal & Otsu Binarization */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">3</span>
                  <span>Denoise & Centering</span>
                </div>
                <div className="w-36 h-36 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={preprocessingResult.denoisedImage}
                    alt="Denoised character"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Median 3x3 + Otsu ({preprocessingResult.otsuThreshold})
                </div>
              </div>

              {/* Stage 4: Resized & Normalized */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-900/60 text-amber-300 text-[10px] flex items-center justify-center font-mono">4</span>
                  <span>Resized & Normalized</span>
                </div>
                <div className="w-36 h-36 rounded-lg bg-white p-1 border-2 border-amber-500/50 flex items-center justify-center overflow-hidden shadow-md shadow-amber-950/30">
                  <img
                    src={preprocessingResult.resizedImage}
                    alt="Resized 224x224 character"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-amber-400 font-mono font-medium">
                  224 × 224 px (CNN Input)
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical & Preprocessing Parameters Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Calculated Preprocessing Metrics
              </h4>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Original Dimensions:</span>
                  <span className="font-mono text-slate-200">{preprocessingResult.originalWidth} × {preprocessingResult.originalHeight} px</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Processed Dimensions:</span>
                  <span className="font-mono text-amber-400 font-semibold">{preprocessingResult.processedWidth} × {preprocessingResult.processedHeight} × {preprocessingResult.channels}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Otsu Optimal Threshold ($t^*$):</span>
                  <span className="font-mono text-slate-200">{preprocessingResult.otsuThreshold} / 255</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Mean Pixel Intensity:</span>
                  <span className="font-mono text-slate-200">{preprocessingResult.meanIntensity}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Pixel Intensity Variance:</span>
                  <span className="font-mono text-slate-200">{preprocessingResult.variance}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Foreground Stroke Density:</span>
                  <span className="font-mono text-slate-200">{preprocessingResult.foregroundPercentage}% ({preprocessingResult.foregroundPixelCount} px)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Normalization Tensor Range:</span>
                  <span className="font-mono text-slate-200">[{preprocessingResult.normalizationRange[0]}, {preprocessingResult.normalizationRange[1]}]</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Noise Removal Status:</span>
                  <span className="inline-flex items-center text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> 3×3 Median Filter Applied
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Data Augmentation Visualizer (Report requirement) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Data Augmentation Pipeline Simulation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Active during Training
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Visual Preview with CSS Transform */}
                <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="w-32 h-32 bg-white rounded border border-slate-700 p-2 overflow-hidden flex items-center justify-center">
                    <img
                      src={preprocessingResult.resizedImage}
                      alt="Augmented preview"
                      style={{
                        transform: `rotate(${rotAngle}deg) translate(${shiftX}px, ${shiftY}px) scale(${zoomScale})`,
                        transition: 'transform 0.15s ease-out'
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    Rot: {rotAngle}° | Shift: ({shiftX}, {shiftY})px | Zoom: {zoomScale}x
                  </span>
                </div>

                {/* Sliders */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1"><RotateCw className="w-3 h-3 text-amber-400" /> Rotation:</span>
                      <span className="font-mono text-slate-200">{rotAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={rotAngle}
                      onChange={(e) => setRotAngle(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1"><Move className="w-3 h-3 text-emerald-400" /> X-Shift:</span>
                      <span className="font-mono text-slate-200">{shiftX} px</span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      value={shiftX}
                      onChange={(e) => setShiftX(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-cyan-400" /> Zoom/Scale:</span>
                      <span className="font-mono text-slate-200">{zoomScale}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.05"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
