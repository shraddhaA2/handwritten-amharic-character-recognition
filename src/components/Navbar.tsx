import React from 'react';
import {
  Scan,
  SlidersHorizontal,
  BarChart3,
  Cpu,
  FileSpreadsheet,
  Grid,
  BookOpen,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export type NavTab = 'recognition' | 'preprocessing' | 'comparison' | 'training' | 'results' | 'dataset' | 'about';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentCnn: string;
  currentClassifier: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentCnn,
  currentClassifier
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'recognition', label: 'Recognition', icon: <Scan className="w-4 h-4" /> },
    { id: 'preprocessing', label: 'Preprocessing', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'comparison', label: 'Model Comparison', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'training', label: 'Training Studio', icon: <Cpu className="w-4 h-4" /> },
    { id: 'results', label: 'Results & Logs', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'dataset', label: 'Fidel Dataset', icon: <Grid className="w-4 h-4" /> },
    { id: 'about', label: 'Methodology & Report', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('recognition')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/20 text-white font-bold text-xl font-serif">
              ሀ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                  HACR
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  Academic v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Handwritten Amharic Character Recognition
              </p>
            </div>
          </div>

          {/* Active Model Indicator */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400">Active Pipeline:</span>
            <span className="text-amber-400 font-semibold font-mono">{currentCnn}</span>
            <span className="text-slate-500">+</span>
            <span className="text-emerald-400 font-semibold font-mono">{currentClassifier}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Ready
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-700/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
