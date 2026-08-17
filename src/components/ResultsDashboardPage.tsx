import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Database,
  Search,
  Filter
} from 'lucide-react';
import { TrainingLogEntry, EvaluationMetric } from '../types';

export const ResultsDashboardPage: React.FC = () => {
  const [logs, setLogs] = useState<TrainingLogEntry[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (data.trainingLogs) setLogs(data.trainingLogs);
      if (data.evaluations) setEvaluations(data.evaluations);
    } catch (err) {
      console.error('Failed to load training logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDownloadCsv = () => {
    // Generate CSV content
    const headers = ['Model ID', 'CNN Architecture', 'Classifier', 'Accuracy', 'Precision', 'Recall', 'F1-Score', 'Train Time (s)', 'Inference Time (ms)'];
    const rows = evaluations.map(e => [
      e.id,
      e.cnnModel,
      e.classifier,
      e.accuracy,
      e.precision,
      e.recall,
      e.f1Score,
      e.trainingTimeSec,
      e.inferenceTimeMs
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hacr_academic_evaluation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(l =>
    l.cnnModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.classifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 font-semibold tracking-wider uppercase mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Experiment Tracking & Academic Artifacts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          RESULTS & EXPERIMENT LOGS
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Permanent persistence log of training runs, evaluation checkpoints, hyperparameter matrices, and downloadable CSV records for research documentation.
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search training logs by model or classifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchResults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* CSV Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Persisted Model Evaluation Records (`results/training_results.csv`)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredLogs.length} Records Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Run Timestamp</th>
                <th className="py-3 px-4">Model ID</th>
                <th className="py-3 px-4">CNN Architecture</th>
                <th className="py-3 px-4">Classifier</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">F1-Score</th>
                <th className="py-3 px-4 text-right">Train Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No matching training logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">
                      {log.cnnModel}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-mono">
                      {log.classifier}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {(log.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                      {log.f1Score.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {log.trainingDurationSec}s
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
