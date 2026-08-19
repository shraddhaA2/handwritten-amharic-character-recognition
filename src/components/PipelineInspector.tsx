import React from "react";
import { Layers, ArrowRight, Check, Image as ImageIcon, Sliders, Cpu, GitBranch } from "lucide-react";

export const PipelineInspector: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: "Grayscale & Noise Filter",
      input: "Raw Image (28×28)",
      output: "8-bit Grayscale",
      desc: "Loads input image, eliminates chromatic noise using Gaussian blur, and computes luminance matrix.",
      icon: ImageIcon,
    },
    {
      step: 2,
      title: "Otsu Binarization & Crop",
      input: "Grayscale Matrix",
      output: "Centered Binary Stroke",
      desc: "Applies Otsu adaptive thresholding to isolate strokes and centers character with aspect-ratio padding.",
      icon: Sliders,
    },
    {
      step: 3,
      title: "ResNet50 Transfer Learning",
      input: "224×224×3 RGB Tensor",
      output: "2048-d Feature Vector",
      desc: "Passes normalized image through ImageNet-pretrained ResNet50 CNN backbone, extracting 2048 deep features before FC head.",
      icon: Cpu,
    },
    {
      step: 4,
      title: "SVM Classification",
      input: "2048-d Feature Vector",
      output: "Predicted Class (238)",
      desc: "Support Vector Machine with RBF kernel maps features across multi-class hyperplanes to calculate confidence and category.",
      icon: GitBranch,
    },
  ];

  return (
    <div id="pipeline-inspector" className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Layers className="w-4 h-4 text-slate-700" />
            End-to-End ML Architecture & Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transfer learning workflow: Image Preprocessing → Pretrained CNN Features → Support Vector Machine
          </p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold">
          Transfer Learning
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative flex flex-col p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                  {s.step}
                </span>
                <Icon className="w-4 h-4 text-slate-500" />
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">{s.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3 flex-1">{s.desc}</p>

              <div className="pt-2.5 border-t border-slate-200 flex flex-col gap-1 text-[10px] font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>In:</span>
                  <span className="text-slate-700 font-semibold">{s.input}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Out:</span>
                  <span className="text-slate-900 font-bold">{s.output}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
