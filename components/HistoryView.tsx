
import React from 'react';
import { HistoryItem, SwingReport, ComparativeReport, SwingPhaseAnalysis, Drill } from '../types';
import { ALL_DRILLS } from './DrillsLibrary';

interface HistoryViewProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onDrillSelect: (drill: Drill) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ items, onSelectItem, onDeleteItem, onDrillSelect }) => {
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);

  const getDrillItems = (data: SwingReport) => {
    return (Object.entries(data.metrics) as [string, SwingPhaseAnalysis][])
      .flatMap(([phase, m]) => m.drills.map(dName => {
        let drillObj = ALL_DRILLS.find(d => 
          d.title.toLowerCase().includes(dName.toLowerCase()) || 
          dName.toLowerCase().includes(d.title.toLowerCase())
        );

        if (!drillObj) {
          drillObj = {
            id: `gen-${dName.toLowerCase().replace(/\s+/g, '-')}`,
            title: dName,
            description: `Corrective training specifically suggested for this session.`,
            steps: ["Follow analysis feedback.", "Setup controls.", "Execute reps."],
            category: 'Path',
            difficulty: 'Intermediate',
            duration: '15 mins'
          };
        }
        return drillObj;
      }))
      .slice(0, 3);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-oswald font-bold text-white mb-2">NO SESSIONS RECORDED</h3>
        <p className="text-slate-500">Run an analysis to start building your swing history vault.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fadeIn">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-oswald font-bold text-white mb-2 uppercase italic tracking-tight">SESSION VAULT</h2>
          <p className="text-slate-400">Review your mechanical evolution and training history.</p>
        </div>
        <div className="text-right">
          <span className="text-emerald-500 font-mono text-sm font-bold">{items.length} SESSIONS SAVED</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => (
          <div 
            key={item.id}
            className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 flex flex-col h-full"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${item.type === 'analysis' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {item.type}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">
                {item.summaryTitle}
              </h4>
              <p className="text-slate-500 text-xs font-mono mb-6">
                {new Date(item.timestamp).toLocaleDateString('en-US', { 
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </p>

              <div className="flex-grow">
                {item.type === 'analysis' ? (
                  <>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex-1">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Score</span>
                        <span className="text-2xl font-oswald text-emerald-400">{(item.data as SwingReport).overallScore}</span>
                      </div>
                      <div className="flex-1">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Velo</span>
                        <span className="text-xl font-oswald text-white">{(item.data as SwingReport).estimatedStats.exitVelocity || '--'}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <span className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Focus Areas</span>
                      <div className="flex flex-wrap gap-1.5">
                        {getDrillItems(item.data as SwingReport).map((drill, idx) => (
                          <button 
                            key={idx} 
                            onClick={(e) => { e.stopPropagation(); onDrillSelect(drill); }}
                            className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 transition-all text-left"
                          >
                            {drill.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-6">
                     <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed">"{(item.data as ComparativeReport).comparisonSummary}"</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => onSelectItem(item)}
                className="w-full mt-auto py-2.5 bg-slate-700 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Review Analysis</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
