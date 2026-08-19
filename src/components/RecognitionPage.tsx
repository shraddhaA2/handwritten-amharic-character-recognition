import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart2,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { ImageInputSection } from './ImageInputSection';
import { CNNModelType, ClassifierType, PredictionResponse } from '../types';
import { CNN_CONFIGS } from '../../server/featureExtraction';

interface RecognitionPageProps {
  onInspectPreprocessing: () => void;
  selectedCnn: CNNModelType;
  setSelectedCnn: (cnn: CNNModelType) => void;
  selectedClassifier: ClassifierType;
  setSelectedClassifier: (clf: ClassifierType) => void;
  predictionResult: PredictionResponse | null;
  setPredictionResult: (res: PredictionResponse | null) => void;
  currentImageData: string | null;
  setCurrentImageData: (data: string | null) => void;
  imageMeta: { name: string; width: number; height: number; sizeKb: number; source: string } | null;
  setImageMeta: (meta: any) => void;
}

export const RecognitionPage: React.FC<RecognitionPageProps> = ({
  onInspectPreprocessing,
  selectedCnn,
  setSelectedCnn,
  selectedClassifier,
  setSelectedClassifier,
  predictionResult,
  setPredictionResult,
  currentImageData,
  setCurrentImageData,
  imageMeta,
  setImageMeta
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingSteps = [
    '1. Preprocessing image (Grayscale, Otsu binarization, Centering, 224x224 Bilinear Resize, ImageNet Normalization)...',
    `2. Extracting deep features using pretrained ${selectedCnn} (${CNN_CONFIGS[selectedCnn]?.featureDim}-D spatial vector)...`,
    `3. Running ${selectedClassifier} classifier on feature vector...`,
    '4. Generating prediction & calibrated posterior probabilities...'
  ];

  // Perform Character Recognition via backend API
  const handleRecognize = async () => {
    if (!currentImageData) {
      setErrorMessage('Please upload, draw, or select a handwritten character image first.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStepIndex(0);

    try {
      // Step 1
      setCurrentStepIndex(1);
      await new Promise(r => setTimeout(r, 200));

      // Step 2
      setCurrentStepIndex(2);
      await new Promise(r => setTimeout(r, 250));

      // Step 3: Call API
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImageData,
          cnnModel: selectedCnn,
          classifier: selectedClassifier,
          topK: 5
        })
      });

      // Step 4
      setCurrentStepIndex(3);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to recognize character.');
      }

      setPredictionResult(data);
    } catch (err: any) {
      console.error('Recognition error:', err);
      setErrorMessage(err.message || 'An error occurred during recognition.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetImage = () => {
    setCurrentImageData(null);
    setImageMeta(null);
    setPredictionResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Description specified in the academic requirements */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 font-semibold tracking-wider uppercase mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Academic Transfer Learning & ML Inference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          HANDWRITTEN AMHARIC CHARACTER RECOGNITION
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Upload a handwritten Amharic character image and use the trained hybrid deep learning (CNN feature extraction) and machine learning models to recognize it.
        </p>
      </div>

      {/* Main Two-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Input & Model Controls (5 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Image Input Section */}
          <ImageInputSection
            currentImageData={currentImageData}
            onImageSelected={(dataUrl, meta) => {
              setCurrentImageData(dataUrl);
              setImageMeta(meta);
              setPredictionResult(null);
              setErrorMessage(null);
            }}
            onReset={handleResetImage}
            metadata={imageMeta}
          />

          {/* Model Selection & Prediction Trigger Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Model Configuration</span>
              <span className="text-[11px] text-amber-400 font-mono font-normal">
                Transfer Learning Pipeline
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CNN Feature Extractor Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  CNN Feature Extractor:
                </label>
                <div className="relative">
                  <select
                    value={selectedCnn}
                    onChange={(e) => setSelectedCnn(e.target.value as CNNModelType)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                  >
                    <option value="VGG16">VGG16 (4096-D)</option>
                    <option value="ResNet50">ResNet50 (2048-D)</option>
                    <option value="VGG19">VGG19 (4096-D)</option>
                    <option value="AlexNet">AlexNet (4096-D)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {CNN_CONFIGS[selectedCnn]?.description}
                </p>
              </div>

              {/* Classifier Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Classifier:
                </label>
                <div className="relative">
                  <select
                    value={selectedClassifier}
                    onChange={(e) => setSelectedClassifier(e.target.value as ClassifierType)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                  >
                    <option value="SVM">SVM (Support Vector Machine)</option>
                    <option value="RandomForest">Random Forest</option>
                    <option value="XGBoost">XGBoost</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedClassifier === 'SVM' && 'One-vs-Rest RBF Kernel with Platt scaling'}
                  {selectedClassifier === 'RandomForest' && '100 Randomized Decision Trees ensemble'}
                  {selectedClassifier === 'XGBoost' && 'Extreme Gradient Boosted Trees (Softmax)'}
                </p>
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="bg-red-950/40 border border-red-800/80 rounded-lg p-3 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleRecognize}
              disabled={isProcessing || !currentImageData}
              className={`w-full py-3.5 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isProcessing
                  ? 'bg-amber-700 text-amber-200 cursor-wait'
                  : !currentImageData
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold shadow-amber-900/30'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Recognizing Character...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>RECOGNIZE CHARACTER</span>
                </>
              )}
            </button>

            {/* Live Progress Stepper during inference */}
            {isProcessing && (
              <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <span>Inference Pipeline</span>
                  <span>Step {currentStepIndex + 1} of 4</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  {processingSteps[currentStepIndex]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prediction Results & Analysis (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {predictionResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    PREDICTION RESULT
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Model: <span className="text-slate-200 font-semibold">{predictionResult.cnnModel} + {predictionResult.classifier}</span>
                  </div>
                </div>

                <button
                  onClick={onInspectPreprocessing}
                  className="text-xs text-amber-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Inspect Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Recognized Character Hero */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950/80 rounded-xl p-5 border border-slate-800/90 gap-6">
                <div className="flex items-center space-x-5">
                  {/* Large Amharic Glyph */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600/20 to-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-black text-5xl shadow-lg shadow-amber-950/50">
                    {predictionResult.predictedCharacter}
                  </div>

                  <div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{predictionResult.characterDetails.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 font-mono rounded">
                        {predictionResult.characterDetails.unicode}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                      Phonetic: <span className="font-mono text-amber-300 font-semibold">/{predictionResult.characterDetails.phonetic}/</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Family: <span className="text-slate-200">{predictionResult.characterDetails.family}</span> • Order: <span className="text-slate-200">{predictionResult.characterDetails.orderName} ({predictionResult.characterDetails.order}st)</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className="text-center sm:text-right bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-lg min-w-[120px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    Confidence
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {Math.round(predictionResult.confidence * 1000) / 10}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {predictionResult.inferenceTimeMs} ms latency
                  </div>
                </div>
              </div>

              {/* Top-5 Probability Distribution */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                  Top Candidate Class Distribution (Posterior Probability)
                </h4>
                <div className="space-y-2.5">
                  {predictionResult.topCandidates.map((cand, idx) => {
                    const pct = Math.round(cand.confidence * 1000) / 10;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 font-medium">
                            <span className="w-6 h-6 rounded bg-slate-800 text-center flex items-center justify-center font-serif text-sm font-bold text-amber-300">
                              {cand.character}
                            </span>
                            <span className="text-slate-200">{cand.name}</span>
                            <span className="text-[11px] text-slate-400">({cand.orderName})</span>
                          </div>
                          <span className="font-mono text-slate-300 font-semibold">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-emerald-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.max(2, pct)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Extraction Telemetry & Visual Embedding */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    Deep Feature Embedding ({predictionResult.featureDimension}-D Vector)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Extracted in {predictionResult.featureExtractionTimeMs} ms
                  </span>
                </div>

                {/* Mini Heatmap Visualization of Feature Subspace */}
                <div className="grid grid-cols-16 gap-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {predictionResult.featureSample.map((val, idx) => {
                    const intensity = Math.min(255, Math.max(0, Math.round(val * 350)));
                    return (
                      <div
                        key={idx}
                        className="h-4 rounded-sm transition-all hover:scale-125"
                        style={{
                          backgroundColor: `rgb(${Math.round(intensity * 0.9)}, ${Math.round(intensity * 0.7)}, ${intensity > 30 ? 50 : 20})`
                        }}
                        title={`f[${idx * Math.floor(predictionResult.featureDimension / 32)}]: ${val}`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Preprocessed:</span>
                    <span className="text-slate-200">224×224 Normal</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Extractor:</span>
                    <span className="text-amber-400">{predictionResult.cnnModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Classifier:</span>
                    <span className="text-emerald-400">{predictionResult.classifier}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder State */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/70 border border-slate-700 flex items-center justify-center text-slate-500">
                <Sparkles className="w-8 h-8 opacity-60" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-semibold text-slate-200">
                  Awaiting Character Input
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a sample handwritten character, draw with the brush stylus, or upload an image, then click <strong>RECOGNIZE CHARACTER</strong>.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs text-slate-500 font-mono bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
                <span>Default Pipeline:</span>
                <span className="text-amber-400">VGG16 + SVM</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
