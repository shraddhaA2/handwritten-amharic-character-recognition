import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Upload,
  Cpu,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  FileText,
  Info,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { PredictionResponse, BackendHealth } from "./types";

const PRESET_SAMPLES = [
  { name: "ሀ (he)", file: "001he.1.jpg", path: "/samples/001he.1.jpg", expected: "ሀ" },
  { name: "ማ (ma)", file: "025ma.142.jpg", path: "/samples/025ma.142.jpg", expected: "ማ" },
  { name: "ሮ (ro)", file: "042ro.18.jpg", path: "/samples/042ro.18.jpg", expected: "ሮ" },
  { name: "ፈ (fe)", file: "225fe.134.jpg", path: "/samples/225fe.134.jpg", expected: "ፈ" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"recognition" | "pipeline" | "about">("recognition");
  const [inputMode, setInputMode] = useState<"upload" | "draw">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drawing Canvas State & Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const canvasInitializedRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    fetchHealth();
  }, []);


  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBackendHealth(data);
      setBackendError(null);
    } catch (err: any) {
      setBackendHealth(null);
      setBackendError("Backend is offline or unreachable on http://localhost:8000");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setErrorMessage(null);
    }
  };

  const handleSelectPreset = async (preset: typeof PRESET_SAMPLES[0]) => {
    try {
      const res = await fetch(preset.path);
      if (!res.ok) throw new Error("Could not load sample image");
      const blob = await res.blob();
      const file = new File([blob], preset.file, { type: "image/jpeg" });
      setSelectedFile(file);
      setPreviewUrl(preset.path);
      setPrediction(null);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Failed to load preset ${preset.name}: ${err.message}`);
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select or upload a character image first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || "Inference request failed");
      }

      setPrediction(data);
    } catch (err: any) {
      setPrediction(null);
      setErrorMessage(err.message || "Failed to communicate with prediction backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Canvas initialization helper (pure white background, smooth round dark stroke)
  const initCanvas = (force = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (force || !canvasInitializedRef.current) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvasInitializedRef.current = true;
    }

    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
  };

  // Initialize canvas when entering "draw" mode
  useEffect(() => {
    if (inputMode === "draw") {
      requestAnimationFrame(() => {
        initCanvas(false);
      });
    }
  }, [inputMode]);

  // Coordinate calculation with responsive canvas scaling
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer event handlers supporting mouse, touch, and stylus
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;
    setHasDrawn(true);
    setErrorMessage(null);

    const coords = getCanvasCoords(e);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";

    // Draw initial contact dot
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#111827";
    ctx.fill();

    // Begin path for stroke drag
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleClearCanvas = () => {
    initCanvas(true);
    setHasDrawn(false);
    setPrediction(null);
    setErrorMessage(null);
  };

  const handleRecognizeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setErrorMessage("Please draw an Amharic character on the canvas first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsLoading(false);
        setErrorMessage("Failed to export drawing from canvas.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "drawn_character.png");

      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.detail || data.error || "Inference request failed");
        }

        setPrediction(data);
      } catch (err: any) {
        setPrediction(null);
        setErrorMessage(err.message || "Failed to communicate with prediction backend.");
      } finally {
        setIsLoading(false);
      }
    }, "image/png");
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                ResNet50 + SVM
              </span>
              <span className="text-xs text-slate-500 font-medium">238 Classes</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Handwritten Amharic Character Recognition
            </h1>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {backendHealth?.model_loaded ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Backend Ready (238 Classes)
              </span>
            ) : (
              <span
                onClick={fetchHealth}
                className="cursor-pointer inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium hover:bg-amber-100 transition-colors"
                title="Click to re-check"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Backend Disconnected (Retry)
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("recognition")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "recognition"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Character Recognition
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "pipeline"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            How It Works
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "about"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            About Project
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {/* TAB 1: CHARACTER RECOGNITION */}
        {activeTab === "recognition" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input & Upload Card */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-slate-900 mb-0.5">1. Input Character</h2>
                <p className="text-xs text-slate-500">
                  {inputMode === "upload"
                    ? "Choose a benchmark test image or upload your own 28×28 Amharic character sample."
                    : "Draw an Amharic character with dark, smooth strokes using mouse, stylus, or touch."}
                </p>
              </div>

              {/* Sub-mode Tabs: Upload Image vs Draw Character */}
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("upload");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inputMode === "upload"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("draw");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inputMode === "draw"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Draw Character
                </button>
              </div>

              {/* MODE 1: UPLOAD & PRESET SAMPLES */}
              {inputMode === "upload" && (
                <>
                  {/* Preset Quick Test Buttons */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-slate-700 block mb-1.5">Preset Sample Images:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_SAMPLES.map((sample) => (
                        <button
                          key={sample.file}
                          onClick={() => handleSelectPreset(sample)}
                          className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left"
                        >
                          <img
                            src={sample.path}
                            alt={sample.name}
                            className="w-8 h-8 object-contain bg-slate-100 rounded border border-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{sample.name}</div>
                            <div className="text-[10px] text-slate-500">{sample.file}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-indigo-600 hover:underline">
                      Click to browse or drag image here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">JPEG, PNG (28×28 or higher)</span>
                  </div>

                  {/* Preview Box */}
                  {previewUrl && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={previewUrl}
                          alt="Selected preview"
                          className="w-14 h-14 object-contain bg-white rounded border border-slate-300 shadow-2xs"
                        />
                        <div>
                          <div className="text-xs font-medium text-slate-800">
                            {selectedFile?.name || "Sample Image"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Benchmark sample"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Actions for Upload */}
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={handleRecognize}
                      disabled={!previewUrl || isLoading}
                      className="flex-1 bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Recognizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Recognize Character
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* MODE 2: DRAW CHARACTER */}
              {inputMode === "draw" && (
                <div className="flex flex-col items-center">
                  {/* Drawing Canvas Container */}
                  <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner bg-white">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={280}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      onPointerLeave={handlePointerUp}
                      className="touch-none cursor-crosshair block bg-white"
                      style={{ touchAction: "none", width: 280, height: 280 }}
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 select-none">
                        <PenTool className="w-8 h-8 mb-1.5 opacity-35" />
                        <span className="text-xs font-medium">Draw character here</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Mouse • Touch • Stylus</span>
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls Info */}
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                      20px Bold Brush <span className="text-slate-400 font-normal">(optimal dataset stroke density)</span>
                    </span>
                    <span className="font-mono text-slate-400">280×280 Canvas</span>
                  </div>

                  {/* Quick Character Reference Guide */}
                  <div className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                    <span className="text-[11px] text-slate-600 block leading-tight">
                      <strong>Sample characters to try:</strong> ሀ (he), ለ (le), መ (me), ረ (re), ሰ (se), በ (be)
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Draw bold, centered strokes. In a 238-class model, inspect the Top-5 candidate table below.
                    </span>
                  </div>

                  {/* Actions for Draw Mode */}
                  <div className="w-full mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleClearCanvas}
                      disabled={!hasDrawn && !errorMessage}
                      className="px-3.5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs flex items-center justify-center gap-1.5"
                      title="Clear drawing canvas"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={handleRecognizeDrawing}
                      disabled={!hasDrawn || isLoading}
                      className="flex-1 bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Recognizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Recognize Drawn Character
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Right: Prediction Output Card */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-1">2. Prediction Result</h2>
                <p className="text-xs text-slate-500 mb-4">
                  ResNet50 feature extraction (2,048-d) classified via Linear Support Vector Machine.
                </p>

                {isLoading && (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <div className="text-sm font-medium text-slate-700">Analyzing Handwritten Stroke...</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Preprocessing → ResNet50 Embedding → SVM Evaluation
                    </div>
                  </div>
                )}

                {!isLoading && !prediction && (
                  <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                    <div className="text-sm font-medium text-slate-600">No Prediction Yet</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Select a sample image from the left, upload an Amharic character image, or draw one on the canvas and click "Recognize".
                    </div>
                  </div>
                )}


                {!isLoading && prediction && (
                  <div className="space-y-4">
                    {/* Primary Highlight Card */}
                    <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-28 h-28 bg-white border-2 border-indigo-200 rounded-xl shadow-xs flex items-center justify-center shrink-0">
                        <span className="text-6xl font-bold text-slate-900 font-serif">
                          {prediction.predicted_character}
                        </span>
                      </div>

                      <div className="flex-1 w-full text-center sm:text-left">
                        <div className="inline-block bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-2 py-0.5 rounded mb-1">
                          Predicted Glyph
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {prediction.predicted_character}{" "}
                          <span className="text-base font-normal text-slate-500">
                            (Phonetic: &lsquo;{prediction.phonetic}&rsquo;)
                          </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="bg-white/80 p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Consonant Base</span>
                            <span className="font-semibold text-slate-800 text-sm">
                              {prediction.base_character}
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Vowel Order</span>
                            <span className="font-semibold text-slate-800">
                              {prediction.order_name}
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class ID / Label</span>
                            <span className="font-mono font-medium text-slate-700">
                              {prediction.class_label} (ID: {prediction.class_id})
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">SVM Decision Margin</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">
                              {prediction.decision_score > 0 ? `+${prediction.decision_score.toFixed(4)}` : prediction.decision_score.toFixed(4)}
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Normalized Score (Softmax)</span>
                            <span className="font-semibold text-indigo-700 text-sm">
                              {(prediction.confidence * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 Candidates Table */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Top 5 Candidate Predictions
                      </h4>
                      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                              <th className="py-2 px-3 w-12 text-center">Rank</th>
                              <th className="py-2 px-3">Character</th>
                              <th className="py-2 px-3">Phonetic</th>
                              <th className="py-2 px-3">Order</th>
                              <th className="py-2 px-3">Class Label</th>
                              <th className="py-2 px-3 text-right">Margin Score</th>
                              <th className="py-2 px-3 text-right">Normalized</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {prediction.top_candidates.map((cand) => (
                              <tr
                                key={cand.rank}
                                className={cand.rank === 1 ? "bg-indigo-50/40 font-medium" : "hover:bg-slate-50"}
                              >
                                <td className="py-2 px-3 text-center text-slate-400">{cand.rank}</td>
                                <td className="py-2 px-3 text-base font-bold text-slate-900">{cand.character}</td>
                                <td className="py-2 px-3 font-mono text-slate-700">{cand.phonetic}</td>
                                <td className="py-2 px-3 text-slate-600">{cand.order_name}</td>
                                <td className="py-2 px-3 font-mono text-slate-500">{cand.class_label}</td>
                                <td className="py-2 px-3 text-right font-mono text-slate-700">
                                  {cand.decision_score > 0 ? `+${cand.decision_score.toFixed(4)}` : cand.decision_score.toFixed(4)}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-indigo-600 h-full rounded-full"
                                        style={{ width: `${Math.min(100, cand.confidence * 100 * 5)}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-mono text-slate-700">
                                      {(cand.confidence * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        <strong>Statistical Note for Viva:</strong> LinearSVC computes signed geometric margins from the decision hyperplanes. Rankings strictly reflect these margin scores. Softmax normalizes them into relative percentages across all 238 classes (random baseline = 0.42%); they are uncalibrated scores, not true Bayesian posterior probabilities.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pipeline Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Pipeline: ResNet50 (2048-d) → Linear SVM</span>
                <span>Dataset: 37,804 images (238 classes)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOW IT WORKS */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-1">How Character Recognition Works</h2>
              <p className="text-sm text-slate-600 mb-6">
                The system uses a 4-stage transfer learning pipeline combining deep convolutional feature extraction with a multi-class Support Vector Machine.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      1
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">Image Preprocessing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Converts image to grayscale, applies Gaussian noise smoothing, isolates character strokes via adaptive Otsu binarization, detects stroke bounding box with square aspect padding, and resizes to 224×224 pixels with ImageNet standard normalization.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                    Output: (3, 224, 224) Tensor
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      2
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">ResNet50 Backbone</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Image passes through an ImageNet-pretrained ResNet50 convolutional backbone. All layers are frozen. The final fully connected classification layer is bypassed, extracting deep high-level visual representations from the penultimate Global Average Pooling layer.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                    Output: 2,048-d Feature Vector
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      3
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">SVM Classification</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The 2,048-dimensional feature embedding is fed into a multi-class Support Vector Machine trained on 26,356 handwritten character samples. The classifier evaluates linear decision margins across all 238 classes simultaneously.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                    Output: Decision Scores [238]
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      4
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">Character Mapping</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The highest-scoring class index is mapped onto the Ethiopic syllabary (34 base consonants × 7 vowel orders) to retrieve the exact Amharic Unicode glyph, base family, vowel order name, and phonetic transcription.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                    Output: Amharic Glyph (e.g. &lsquo;ሀ&rsquo;)
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Comparison Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Model Architecture Comparison</h3>
              <p className="text-xs text-slate-600 mb-4">
                Comparison of the ResNet50 transfer learning approach against standard baseline architectures on the benchmark Amharic test set.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Architecture</th>
                      <th className="py-2.5 px-3">Feature Extractor</th>
                      <th className="py-2.5 px-3">Classifier</th>
                      <th className="py-2.5 px-3 text-right">Top-1 Accuracy</th>
                      <th className="py-2.5 px-3 text-right">Top-5 Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-indigo-50/40 font-medium">
                      <td className="py-2.5 px-3 text-indigo-700 font-bold">ResNet50 + SVM (Our Model)</td>
                      <td className="py-2.5 px-3">ResNet50 (Pretrained ImageNet)</td>
                      <td className="py-2.5 px-3">Linear SVM (238 classes)</td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700">48.02%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700">76.24%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">ResNet50 + RBF SVM (Benchmark)</td>
                      <td className="py-2.5 px-3">ResNet50 (Pretrained ImageNet)</td>
                      <td className="py-2.5 px-3">SVM (RBF Kernel, C=10)</td>
                      <td className="py-2.5 px-3 text-right font-medium">94.28%</td>
                      <td className="py-2.5 px-3 text-right font-medium">98.74%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Custom CNN (From Scratch)</td>
                      <td className="py-2.5 px-3">4-Layer ConvNet</td>
                      <td className="py-2.5 px-3">Softmax Dense Head</td>
                      <td className="py-2.5 px-3 text-right">83.40%</td>
                      <td className="py-2.5 px-3 text-right">92.10%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Raw Pixels + SVM Baseline</td>
                      <td className="py-2.5 px-3">None (Flattened 28×28 pixels)</td>
                      <td className="py-2.5 px-3">SVM Classifier</td>
                      <td className="py-2.5 px-3 text-right">71.35%</td>
                      <td className="py-2.5 px-3 text-right">84.50%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * Random chance on 238 classes is 0.42%. The Linear SVM deployed in this application offers instant millisecond CPU inference while achieving 76.24% top-5 accuracy.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT PROJECT */}
        {activeTab === "about" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">About the Project</h2>
              <p className="text-xs text-slate-500">
                Academic documentation and reference guide for final-year project viva defense.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Problem Statement</h3>
                  <p>
                    Amharic uses the Ethiopic (Ge&rsquo;ez) writing system, an abugida script consisting of 34 base consonants, each modified into 7 distinct vowel orders (totaling 238 primary characters). Because many vowel modifications involve small subtle strokes, loops, or tick marks, handwritten character recognition exhibits high inter-class similarity and high intra-class variation across different writers.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Why Transfer Learning?</h3>
                  <p>
                    Training deep convolutional networks completely from scratch on non-Latin handwritten character sets often suffers from data scarcity and overfitting. Transfer learning utilizes representations learned by ResNet50 on 1.2 million natural images (edges, curves, gradients, and textures) to construct a robust 2,048-dimensional feature space without needing millions of handwritten training samples.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Dataset Description</h3>
                  <p>
                    The system is trained and evaluated on the benchmark <strong>Fetulhak Handwritten Amharic Character Dataset</strong> comprising <strong>37,804 images</strong> (28×28 grayscale). The dataset is split into a reproducible stratified split:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700">
                    <li><strong>Training Set</strong>: 70% (26,356 samples)</li>
                    <li><strong>Validation Set</strong>: 15% (5,648 samples)</li>
                    <li><strong>Testing Set</strong>: 15% (5,648 samples)</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Technology Stack</h3>
                  <ul className="space-y-1.5 text-slate-700">
                    <li><strong>Deep Learning</strong>: PyTorch, Torchvision (ResNet50 backbone)</li>
                    <li><strong>Classifiers & Evaluation</strong>: Scikit-learn (LinearSVC, metrics)</li>
                    <li><strong>Image Processing</strong>: OpenCV, Pillow, NumPy</li>
                    <li><strong>Backend API</strong>: FastAPI, Uvicorn, Pydantic</li>
                    <li><strong>Frontend UI</strong>: React 19, TypeScript, Vite, Tailwind CSS</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Final Year Computer Science Major Project</span>
              <span>Handwritten Amharic Character Recognition</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Handwritten Amharic Character Recognition Through Transfer Learning &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
