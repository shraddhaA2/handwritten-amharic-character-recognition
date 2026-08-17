import React, { useState } from 'react';
import {
  Grid,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { AMHARIC_DATASET_FAMILIES, ORDER_NAMES, AmharicCharacterMeta } from '../data/amharicData';

interface DatasetExplorerPageProps {
  onSelectCharacterForTest: (char: string, name: string) => void;
}

export const DatasetExplorerPage: React.FC<DatasetExplorerPageProps> = ({
  onSelectCharacterForTest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<number | 'ALL'>('ALL');
  const [selectedCharDetail, setSelectedCharDetail] = useState<AmharicCharacterMeta | null>(null);

  // Flatten characters
  const allCharacters: AmharicCharacterMeta[] = [];
  AMHARIC_DATASET_FAMILIES.forEach(family => {
    family.characters.forEach(c => allCharacters.push(c));
  });

  const filteredCharacters = allCharacters.filter(c => {
    const matchesSearch =
      c.char.includes(searchQuery) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phonetic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrder = selectedOrderFilter === 'ALL' || c.order === selectedOrderFilter;

    return matchesSearch && matchesOrder;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 font-semibold tracking-wider uppercase mb-1">
          <Grid className="w-3.5 h-3.5" />
          <span>Ethiopic Fidel Abugida Character Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AMHARIC DATASET EXPLORER
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Comprehensive inventory of the 33 primary consonant base families across 7 vowel orders (231 distinct character classes) recognized by the hybrid system.
        </p>
      </div>

      {/* Controls: Search & Order Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Amharic glyph, name (e.g. Ha, Le), or family..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Order Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedOrderFilter('ALL')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              selectedOrderFilter === 'ALL'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            All Orders
          </button>
          {ORDER_NAMES.map((ord) => (
            <button
              key={ord.order}
              onClick={() => setSelectedOrderFilter(ord.order)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${
                selectedOrderFilter === ord.order
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {ord.order}. {ord.name} ({ord.vowel})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Character Catalog (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Character Classes ({filteredCharacters.length} Visible)
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Click any glyph to inspect & test
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredCharacters.map((c) => {
              const isSelected = selectedCharDetail?.char === c.char;
              return (
                <button
                  key={c.char}
                  onClick={() => setSelectedCharDetail(c)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <span className="text-2xl font-serif font-bold">{c.char}</span>
                  <span className="text-[10px] text-slate-300 font-medium truncate max-w-full mt-0.5">{c.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-500">{c.order}st</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Detail & Action Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedCharDetail ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Character Specification</span>
                <span className="text-[11px] text-amber-400 font-mono">{selectedCharDetail.unicode}</span>
              </h3>

              {/* Large Glyph Hero */}
              <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold text-4xl shadow-inner">
                  {selectedCharDetail.char}
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {selectedCharDetail.name}
                  </div>
                  <div className="text-xs text-amber-300 font-mono mt-0.5">
                    Phonetic: /{selectedCharDetail.phonetic}/
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Family: {selectedCharDetail.family}
                  </div>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="divide-y divide-slate-800 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Vowel Order:</span>
                  <span className="text-slate-200 font-medium">{selectedCharDetail.orderName} ({selectedCharDetail.order}st)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Consonant Base:</span>
                  <span className="text-slate-200 font-medium">{selectedCharDetail.family}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Unicode Point:</span>
                  <span className="font-mono text-slate-200">{selectedCharDetail.unicode}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Visual Similarity Group:</span>
                  <span className="text-amber-400 font-mono text-[11px]">Similar stems in order</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCharacterForTest(selectedCharDetail.char, selectedCharDetail.name)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                <span>Test in Recognition Model</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px] space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">No Character Selected</p>
              <p className="text-xs text-slate-500">
                Click any Amharic character in the catalog to view phonetic details, Unicode specifications, and load it into the recognition inference engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
