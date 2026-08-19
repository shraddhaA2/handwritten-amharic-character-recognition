import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, Layers } from "lucide-react";
import { PRESET_SAMPLES } from "../data/categories";

interface ImageUploadProps {
  onImageSelected: (dataUrl: string, classHint?: string) => void;
  selectedImage: string | null;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  selectedImage,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid JPG, PNG, or JPEG image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setActiveHint(null);
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    // Generate high-contrast SVG canvas for the preset
    const canvas = document.createElement("canvas");
    canvas.width = 140;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Amharic character glyph in ink
    ctx.fillStyle = "#111827";
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(preset.character, 70, 75);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setActiveHint(preset.class_id);
    onImageSelected(dataUrl, preset.class_id);
  };

  return (
    <div id="image-upload-component" className="flex flex-col gap-4">
      {/* Drag and Drop Zone */}
      <div
        id="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[200px] ${
          isDragging
            ? "border-slate-800 bg-slate-50 scale-[1.01]"
            : "border-slate-300 hover:border-slate-400 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {selectedImage ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative p-2 rounded-lg border border-slate-200 bg-slate-50 shadow-inner">
              <img
                src={selectedImage}
                alt="Uploaded Amharic Character"
                className="w-28 h-28 object-contain rounded"
              />
              <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">
                Loaded
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Upload Amharic Character Image
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drag & drop dataset JPG (28×28) or any handwritten photo
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              JPG • PNG • JPEG
            </span>
          </div>
        )}
      </div>

      {/* Dataset Sample Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Dataset Sample Presets (Click to Test)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">238 Classes</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {PRESET_SAMPLES.slice(0, 12).map((preset) => (
            <button
              key={preset.class_id}
              type="button"
              onClick={() => loadPreset(preset)}
              className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                activeHint === preset.class_id
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
              }`}
            >
              <span className="text-base font-bold leading-tight font-serif">{preset.character}</span>
              <span className={`text-[10px] font-mono leading-none ${activeHint === preset.class_id ? "text-slate-300" : "text-slate-500"}`}>
                {preset.class_id}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
