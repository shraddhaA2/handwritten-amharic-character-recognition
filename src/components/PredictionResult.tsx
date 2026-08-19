import React from "react";
import { CheckCircle2, Cpu, BarChart3, HelpCircle, Activity } from "lucide-react";
import { PredictionResultData } from "../types";

interface PredictionResultProps {
  result: PredictionResultData | null;
  isLoading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-200 bg-white shadow-xs min-h-[360px]">
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mb-4" />
        <h4 className="text-sm font-semibold text-slate-900">Processing Amharic Character</h4>
        <p className="text-xs text-slate-500 mt-1 text-center max-w-xs leading-relaxed">
          Running Preprocessing → ResNet50 2048-d Feature Extraction → SVM RBF Classification...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 min-h-[360px] text-center">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
          <Activity className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Awaiting Input Character</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Upload a handwritten Amharic character image or draw on the canvas to trigger ResNet50 + SVM recognition.
        </p>
      </div>
    );
  }

  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div id="prediction-result-card" className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Required Architecture Attribution Badge */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs">
        <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
        <p className="font-medium text-[11px] leading-snug">
          Prediction generated using <span className="font-semibold text-slate-900">ResNet50 feature extraction</span> and <span className="font-semibold text-slate-900">SVM classification</span>.
        </p>
      </div>

      {/* Main Character Prediction Highlight */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
            <span className="text-4xl font-bold font-serif text-white">
              {result.character}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-semibold border border-slate-700">
                Class: {result.predicted_class}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Predicted
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1 text-slate-100 tracking-tight">
              {result.phonetic ? `Phonetic: "${result.phonetic}"` : `Amharic Character`}
            </h3>
            {result.order_name && (
              <p className="text-xs text-slate-400 mt-0.5">
                {result.order_name} {result.base_character ? `(Base: ${result.base_character})` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Confidence Percentage Gauge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400">Confidence</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {confidencePct}%
          </p>
        </div>
      </div>

      {/* Top Candidates Ranking */}
      {result.top_candidates && result.top_candidates.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              Top Candidate Predictions (SVM Probability)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Softmax / Platt Scaling</span>
          </div>

          <div className="flex flex-col gap-2">
            {result.top_candidates.map((cand, idx) => {
              const candPct = Math.round(cand.confidence * 100);
              return (
                <div
                  key={cand.class_id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-xs hover:bg-slate-50 transition"
                >
                  <span className="w-5 text-slate-400 font-mono text-[11px] text-center font-bold">
                    #{idx + 1}
                  </span>
                  <span className="text-base font-bold w-6 text-center text-slate-900 font-serif">
                    {cand.character}
                  </span>
                  <span className="font-mono text-slate-600 text-[11px] w-14">
                    {cand.class_id}
                  </span>
                  
                  {/* Probability Bar */}
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? "bg-slate-900" : "bg-slate-400"
                      }`}
                      style={{ width: `${Math.max(4, candPct)}%` }}
                    />
                  </div>

                  <span className="font-mono text-slate-800 font-bold text-[11px] w-10 text-right">
                    {candPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Vector Summary Footer */}
      {result.feature_summary && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
              ResNet50 Feature Embedding:
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {result.feature_summary.dimension}-dim Vector (Layer4 Global Pool)
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto whitespace-nowrap shadow-2xs">
            [{result.feature_summary.sample_values.join(", ")}, ...]
          </div>
        </div>
      )}
    </div>
  );
};
