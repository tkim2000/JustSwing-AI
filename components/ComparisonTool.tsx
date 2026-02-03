
import React, { useState, useRef } from 'react';
import { ComparativeReport, HistoryItem, SwingReport } from '../types';

interface ComparisonToolProps {
  onCompare: (fileA: File, fileB: File) => void;
  onCompareWithHistory: (historyItem: HistoryItem, fileB: File) => void;
  isProcessing: boolean;
  report: ComparativeReport | null;
  history: HistoryItem[];
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({ onCompare, onCompareWithHistory, isProcessing, report, history }) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [useHistoryForA, setUseHistoryForA] = useState(false);
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  const handleRunComparison = () => {
    if (useHistoryForA && selectedHistoryItem && fileB) {
      onCompareWithHistory(selectedHistoryItem, fileB);
    } else if (fileA && fileB) {
      onCompare(fileA, fileB);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setUseHistoryForA(true);
    setFileA(null); // Clear file A when using history
  };

  const handleFileASelect = () => {
    setUseHistoryForA(false);
    setSelectedHistoryItem(null);
  };

  // Filter history to only show analysis items (not comparisons)
  const analysisHistory = history.filter(item => item.type === 'analysis');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <header className="text-center mb-12">
        <h2 className="text-4xl font-oswald font-bold text-white mb-4 italic">SWING EVOLUTION</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Upload two swings to track your mechanical progress over time or compare against a reference clip.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Slot A */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Swing A (Reference)</label>
          
          {/* Toggle between file upload and history selection */}
          <div className="flex gap-2">
            <button
              onClick={handleFileASelect}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                !useHistoryForA 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Upload Video
            </button>
            <button
              onClick={() => setUseHistoryForA(true)}
              disabled={analysisHistory.length === 0}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                useHistoryForA 
                  ? 'bg-emerald-600 text-white' 
                  : analysisHistory.length === 0
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              From History ({analysisHistory.length})
            </button>
          </div>

          {useHistoryForA ? (
            // History selection view
            <div className="aspect-video overflow-y-auto">
              {analysisHistory.length > 0 ? (
                <div className="space-y-2">
                  {analysisHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedHistoryItem?.id === item.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium text-sm">{item.summaryTitle}</p>
                          <p className="text-slate-500 text-xs">
                            {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {(item.data as SwingReport).overallScore && (
                          <span className="text-emerald-400 font-bold text-lg">
                            {(item.data as SwingReport).overallScore}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 h-full flex flex-col justify-center">
                  <p className="text-sm">No previous swings in history</p>
                  <p className="text-xs mt-2">Analyze some swings first to build your history</p>
                </div>
              )}
            </div>
          ) : (
            // File upload view
            <div 
              onClick={() => inputARef.current?.click()}
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${fileA ? 'border-slate-700 bg-slate-800/20' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-slate-800/40'}`}
            >
              {fileA ? (
                <video src={URL.createObjectURL(fileA)} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-slate-500 text-center p-4">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span className="text-sm font-medium">Select Video A</span>
                </div>
              )}
            </div>
          )}
          <input ref={inputARef} type="file" accept="video/*" className="hidden" onChange={(e) => {
            if (e.target.files) {
              setFileA(e.target.files[0]);
              handleFileASelect();
            }
          }} />
        </div>

        {/* Slot B */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Swing B (Current)</label>
          
          {/* Add invisible spacer to match Swing A's toggle buttons height */}
          <div className="h-6"></div>
          
          <div 
            onClick={() => inputBRef.current?.click()}
            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
              ${fileB ? 'border-slate-700 bg-slate-800/20' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-slate-800/40'}`}
          >
            {fileB ? (
              <video src={URL.createObjectURL(fileB)} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-slate-500 text-center p-4">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="text-sm font-medium">Select Video B</span>
              </div>
            )}
          </div>
          <input ref={inputBRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && setFileB(e.target.files[0])} />
        </div>
      </div>

      <div className="flex justify-center mb-16">
        <button 
          disabled={(!useHistoryForA && !fileA) || (useHistoryForA && !selectedHistoryItem) || !fileB || isProcessing}
          onClick={handleRunComparison}
          className={`px-12 py-4 rounded-full font-oswald font-bold text-lg tracking-wider transition-all shadow-xl
            ${(!useHistoryForA && !fileA) || (useHistoryForA && !selectedHistoryItem) || !fileB || isProcessing 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'}`}
        >
          {isProcessing ? 'Analyzing Deltas...' : 'Run Side-by-Side Analysis'}
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
              <h3 className="text-2xl font-oswald font-bold text-white mb-6 uppercase tracking-tight flex items-center">
                <span className="w-2 h-8 bg-emerald-500 mr-4 rounded-sm"></span>
                Progress Report
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg italic mb-8 border-l-4 border-emerald-500/30 pl-6">"{report.comparisonSummary}"</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-4">Improvements</h4>
                  <ul className="space-y-3">
                    {report.improvements.map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-300 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                        <span className="text-emerald-500 mr-3 mt-1">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-4">Areas for Attention</h4>
                  <ul className="space-y-3">
                    {report.regressions.map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-300 bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                        <span className="text-orange-500 mr-3 mt-1">!</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6">Key Stat Changes</h3>
                <div className="space-y-4">
                  {report.metricDeltas.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase">{m.label}</span>
                        <span className="text-white font-oswald text-xl">{m.change}</span>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded capitalize
                        ${m.direction === 'better' ? 'bg-emerald-500/20 text-emerald-400' : 
                          m.direction === 'worse' ? 'bg-red-500/20 text-red-400' : 
                          'bg-slate-700 text-slate-400'}`}>
                        {m.direction}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTool;
