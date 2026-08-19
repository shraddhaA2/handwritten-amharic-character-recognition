import React, { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Terminal,
  Database,
  Sliders,
  Layers,
  Sparkles,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CNNModelType, ClassifierType, TrainingJobResponse } from '../types';

interface TrainingStudioPageProps {
  onModelTrained?: (cnn: CNNModelType, classifier: ClassifierType) => void;
  onNavigateToRecognition: () => void;
}

export const TrainingStudioPage: React.FC<TrainingStudioPageProps> = ({
  onModelTrained,
  onNavigateToRecognition
}) => {
  const [selectedDataset, setSelectedDataset] = useState('benchmark');
  const [cnnModel, setCnnModel] = useState<CNNModelType>('VGG16');
  const [classifier, setClassifier] = useState<ClassifierType>('SVM');

  // Hyperparameters
  const [svmKernel, setSvmKernel] = useState('rbf');
  const [svmC, setSvmC] = useState('1.0');
  const [rfEstimators, setRfEstimators] = useState('100');
  const [xgbLr, setXgbLr] = useState('0.1');

  // Augmentation toggles
  const [augRotation, setAugRotation] = useState(true);
  const [augShift, setAugShift] = useState(true);
  const [augZoom, setAugZoom] = useState(true);

  // Execution state
  const [isTraining, setIsTraining] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [completedJob, setCompletedJob] = useState<TrainingJobResponse | null>(null);

  const startTraining = async () => {
    setIsTraining(true);
    setProgressPct(5);
    setCompletedJob(null);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Initializing training environment...`,
      `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Selected Configuration: ${cnnModel} + ${classifier}`,
      `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Dataset: ${selectedDataset} (14,200 character instances)`
    ]);

    try {
      // Streamed progress simulation steps
      const stages = [
        { pct: 15, msg: 'Loading structured dataset partitions (train=70%, val=15%, test=15%)...' },
        { pct: 35, msg: 'Applying preprocessing (Otsu binarization, centering) & data augmentation (±15° rotation, ±10% shift)...' },
        { pct: 60, msg: `Extracting deep convolutional feature vectors using pretrained ${cnnModel}...` },
        { pct: 85, msg: `Fitting ${classifier} multi-class classifier on extracted feature matrices...` },
        { pct: 95, msg: 'Evaluating on held-out test split & generating confusion matrix...' }
      ];

      for (const s of stages) {
        setCurrentStage(s.msg);
        setProgressPct(s.pct);
        setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [HACR-Trainer] ${s.msg}`]);
        await new Promise(r => setTimeout(r, 650));
      }

      // API Call
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnnModel,
          classifier,
          datasetId: selectedDataset,
          augment: augRotation || augShift || augZoom,
          hyperparameters: {
            kernel: svmKernel,
            C: parseFloat(svmC),
            n_estimators: parseInt(rfEstimators),
            learning_rate: parseFloat(xgbLr)
          }
        })
      });

      const data: TrainingJobResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Training failed.');

      setProgressPct(100);
      setCurrentStage('Training completed successfully!');
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Training finished in ${data.trainingDurationSec}s!`,
        `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Achieved Test Accuracy: ${(data.metrics.accuracy * 100).toFixed(1)}% | F1-Score: ${data.metrics.f1Score}`,
        `[${new Date().toLocaleTimeString()}] [HACR-Trainer] Serialized model saved to: ${data.modelArtifactPath}`
      ]);

      setCompletedJob(data);
      if (onModelTrained) {
        onModelTrained(cnnModel, classifier);
      }
    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`]);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 font-semibold tracking-wider uppercase mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Model Training & Transfer Learning Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          TRAINING STUDIO
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Configure dataset partitions, select deep feature extractors, customize machine learning classifier hyperparameters, and execute end-to-end model training pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-amber-400" />
              Pipeline Configuration
            </h3>

            {/* 1. Dataset Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Amharic Dataset Source:
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="benchmark">HACR Core Benchmark Dataset (14,200 samples)</option>
                <option value="extended">Extended 33 Fidel Family Set (23,100 samples)</option>
                <option value="adhoc">Quick Verification Mini-Split (1,400 samples)</option>
              </select>
            </div>

            {/* 2. CNN Extractor */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Pretrained CNN Feature Extractor:
              </label>
              <select
                value={cnnModel}
                onChange={(e) => setCnnModel(e.target.value as CNNModelType)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="VGG16">VGG16 (4096-D dense penultimate representations)</option>
                <option value="ResNet50">ResNet50 (2048-D Global Average Pooling)</option>
                <option value="VGG19">VGG19 (4096-D deep 16-conv feature representations)</option>
                <option value="AlexNet">AlexNet (4096-D 8-layer architecture)</option>
              </select>
            </div>

            {/* 3. Classifier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Target Machine Learning Classifier:
              </label>
              <select
                value={classifier}
                onChange={(e) => setClassifier(e.target.value as ClassifierType)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="SVM">Support Vector Machine (SVM)</option>
                <option value="RandomForest">Random Forest (Ensemble Trees)</option>
                <option value="XGBoost">XGBoost (Gradient Boosted Trees)</option>
              </select>
            </div>

            {/* Dynamic Hyperparameters */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {classifier} Hyperparameters
              </span>

              {classifier === 'SVM' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Kernel Type:</label>
                    <select
                      value={svmKernel}
                      onChange={(e) => setSvmKernel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-1.5 text-xs"
                    >
                      <option value="rbf">RBF (Gaussian)</option>
                      <option value="linear">Linear</option>
                      <option value="poly">Polynomial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Regularization (C):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={svmC}
                      onChange={(e) => setSvmC(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {classifier === 'RandomForest' && (
                <div className="text-xs">
                  <label className="block text-slate-400 mb-1">Number of Estimators (Trees):</label>
                  <input
                    type="number"
                    value={rfEstimators}
                    onChange={(e) => setRfEstimators(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-1.5 text-xs"
                  />
                </div>
              )}

              {classifier === 'XGBoost' && (
                <div className="text-xs">
                  <label className="block text-slate-400 mb-1">Learning Rate (η):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={xgbLr}
                    onChange={(e) => setXgbLr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-1.5 text-xs"
                  />
                </div>
              )}
            </div>

            {/* 4. Augmentation Toggles */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-slate-300 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Training Data Augmentation:
              </span>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={augRotation}
                    onChange={(e) => setAugRotation(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Affine Rotation (±15°)</span>
                </label>
                <label className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={augShift}
                    onChange={(e) => setAugShift(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Shift (±10%)</span>
                </label>
                <label className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={augZoom}
                    onChange={(e) => setAugZoom(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Zoom / Scale</span>
                </label>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={startTraining}
              disabled={isTraining}
              className={`w-full py-3 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isTraining
                  ? 'bg-amber-700 text-amber-200 cursor-wait'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold shadow-amber-900/30'
              }`}
            >
              {isTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Training in Progress ({progressPct}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-slate-950 fill-current" />
                  <span>START TRAINING PIPELINE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Terminal & Evaluation Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Bar & Current Stage */}
          {isTraining && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
              <div className="flex justify-between text-xs font-mono text-amber-400">
                <span>{currentStage}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success Outcome Card */}
          {completedJob && (
            <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Model Successfully Trained & Evaluated</span>
                </div>
                <button
                  onClick={onNavigateToRecognition}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition-all"
                >
                  <span>Test in Recognition</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Test Accuracy</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {(completedJob.metrics.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Precision</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {(completedJob.metrics.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Recall</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    {(completedJob.metrics.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">F1-Score</span>
                  <span className="text-xl font-extrabold text-purple-400 font-mono">
                    {completedJob.metrics.f1Score.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800">
                Artifact Location: <span className="text-slate-200">{completedJob.modelArtifactPath}</span>
              </div>
            </div>
          )}

          {/* Live Terminal Log Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                <span>Training Telemetry & Python Logs</span>
              </div>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-80 overflow-y-auto bg-slate-950">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-600 italic">
                  Awaiting training initialization... Click "START TRAINING PIPELINE" to execute.
                </div>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('ERROR')
                        ? 'text-red-400'
                        : log.includes('Accuracy')
                        ? 'text-amber-300 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
