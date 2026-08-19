import React, { useState } from "react";
import { Terminal, Copy, Check, Play, BookOpen } from "lucide-react";

export const CliGuide: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const steps = [
    {
      title: "1. Install Python Dependencies",
      command: "pip install -r requirements.txt",
      desc: "Installs PyTorch, Torchvision, Scikit-learn, OpenCV, FastAPI, and required ML tooling.",
    },
    {
      title: "2. Dataset Discovery & Stratified Split (70/15/15)",
      command: "python -m ml.dataset",
      desc: "Scans 'Amharic Character Dataset 1 & 2', extracts 238 classes, and creates 'data/metadata.csv' with random seed 42.",
    },
    {
      title: "3. ResNet50 Feature Extraction & SVM Training",
      command: "python -m ml.train",
      desc: "Extracts 2048-dim features from pretrained ResNet50, caches them to 'models/resnet50_features/', and trains the SVM classifier.",
    },
    {
      title: "4. Test End-to-End Image Inference via CLI",
      command: "python -m ml.predict --image \"data/raw/001he.1.jpg\"",
      desc: "Preprocesses an Amharic character image, extracts features, and outputs JSON prediction with confidence score.",
    },
    {
      title: "5. Evaluate Model on Test Set",
      command: "python -m ml.evaluate",
      desc: "Computes overall accuracy, precision, recall, F1, and saves classification report to 'results/'.",
    },
    {
      title: "6. Start FastAPI ML Backend Server",
      command: "uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload",
      desc: "Starts the Python REST API with '/predict', '/health', '/metrics', and '/categories' endpoints.",
    },
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div id="cli-guide-view" className="flex flex-col gap-5 p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Terminal className="w-5 h-5 text-slate-700" />
            Student Terminal & Execution Quickstart
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Exact shell commands to reproduce the dataset preparation, ResNet50 feature extraction, SVM training, and local testing.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold">
          Python 3.8+ / PyTorch / CUDA or CPU
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="flex flex-col p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">{step.title}</span>
              <button
                type="button"
                onClick={() => handleCopy(step.command, idx)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 transition px-2.5 py-1 rounded-md hover:bg-slate-200/70"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{step.desc}</p>

            <div className="p-3 rounded-lg bg-slate-900 text-blue-300 font-mono text-xs flex items-center justify-between overflow-x-auto shadow-inner">
              <code>{step.command}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
