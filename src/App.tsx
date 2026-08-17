import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { RecognitionPage } from './components/RecognitionPage';
import { PreprocessingPage } from './components/PreprocessingPage';
import { ModelComparisonPage } from './components/ModelComparisonPage';
import { TrainingStudioPage } from './components/TrainingStudioPage';
import { ResultsDashboardPage } from './components/ResultsDashboardPage';
import { DatasetExplorerPage } from './components/DatasetExplorerPage';
import { AcademicAboutPage } from './components/AcademicAboutPage';
import { CNNModelType, ClassifierType, PredictionResponse } from './types';
import { SAMPLE_PRESETS } from './data/amharicData';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('recognition');

  // Active Model Pipeline
  const [selectedCnn, setSelectedCnn] = useState<CNNModelType>('VGG16');
  const [selectedClassifier, setSelectedClassifier] = useState<ClassifierType>('SVM');

  // Active Image & Prediction State
  const [currentImageData, setCurrentImageData] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    name: string;
    width: number;
    height: number;
    sizeKb: number;
    source: string;
  } | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  // Helper to load a character from Dataset Explorer directly into Recognition tab
  const handleSelectCharacterForTest = (char: string, name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 224, 224);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 120px "Noto Sans Ethiopic", "Abyssinica SIL", "Nyala", "Kefa", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 112, 118);

      const dataUrl = canvas.toDataURL('image/png');
      setCurrentImageData(dataUrl);
      setImageMeta({
        name: `${char} (${name})`,
        width: 224,
        height: 224,
        sizeKb: 15.2,
        source: 'dataset'
      });
      setPredictionResult(null);
      setActiveTab('recognition');
    }
  };

  const handleModelTrained = (cnn: CNNModelType, classifier: ClassifierType) => {
    setSelectedCnn(cnn);
    setSelectedClassifier(classifier);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentCnn={selectedCnn}
        currentClassifier={selectedClassifier}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'recognition' && (
          <RecognitionPage
            onInspectPreprocessing={() => setActiveTab('preprocessing')}
            selectedCnn={selectedCnn}
            setSelectedCnn={setSelectedCnn}
            selectedClassifier={selectedClassifier}
            setSelectedClassifier={setSelectedClassifier}
            predictionResult={predictionResult}
            setPredictionResult={setPredictionResult}
            currentImageData={currentImageData}
            setCurrentImageData={setCurrentImageData}
            imageMeta={imageMeta}
            setImageMeta={setImageMeta}
          />
        )}

        {activeTab === 'preprocessing' && (
          <PreprocessingPage
            currentImageData={currentImageData}
            imageMeta={imageMeta}
          />
        )}

        {activeTab === 'comparison' && <ModelComparisonPage />}

        {activeTab === 'training' && (
          <TrainingStudioPage
            onModelTrained={handleModelTrained}
            onNavigateToRecognition={() => setActiveTab('recognition')}
          />
        )}

        {activeTab === 'results' && <ResultsDashboardPage />}

        {activeTab === 'dataset' && (
          <DatasetExplorerPage
            onSelectCharacterForTest={handleSelectCharacterForTest}
          />
        )}

        {activeTab === 'about' && <AcademicAboutPage />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded bg-amber-600 text-white font-serif font-bold flex items-center justify-center text-xs">
              ሀ
            </span>
            <span className="font-semibold text-slate-200">
              Handwritten Amharic Character Recognition (HACR)
            </span>
            <span className="text-slate-500">•</span>
            <span>Academic Research Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Transfer Learning: AlexNet, VGG16, VGG19, ResNet50</span>
            <span>•</span>
            <span>Classifiers: SVM, Random Forest, XGBoost</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
