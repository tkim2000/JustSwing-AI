import React, { useState, useEffect } from 'react';
import VideoUploader from './components/VideoUploader';
import AnalysisReport from './components/AnalysisReport';
import DrillsLibrary from './components/DrillsLibrary';
import ComparisonTool from './components/ComparisonTool';
import HistoryView from './components/HistoryView';
import DrillDetail from './components/DrillDetail';
import { analyzeSwingVideo, compareSwings } from './services/geminiService';
import { AnalysisState, SwingReport, ComparativeReport, AppView, HistoryItem, Drill, DrillProgress, UserSkillProfile } from './types';
import { ProgressService } from './services/progressService';

const STORAGE_KEY = 'justswing_history_v1';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    currentView: 'analysis',
    selectedDrill: null,
    isAnalyzing: false,
    error: null,
    report: null,
    compareReport: null,
    history: [],
    drillProgress: [],
    userProfile: null
  });

  // Load history and progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    // Load drill progress
    const drillProgress = ProgressService.getDrillProgress();
    setState(prev => ({ ...prev, drillProgress }));
    
    // Load user profile
    const userProfile = ProgressService.getUserProfile();
    setState(prev => ({ ...prev, userProfile }));
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
  }, [state.history]);

  const addToHistory = (type: 'analysis' | 'comparison', data: SwingReport | ComparativeReport) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      data,
      summaryTitle: type === 'analysis' 
        ? `Swing Score: ${(data as SwingReport).overallScore}/100`
        : `Mechanical Comparison`
    };
    setState(prev => ({ ...prev, history: [newItem, ...prev.history] }));
  };

  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    const videoUrl = URL.createObjectURL(file);
    try {
      const base64Video = await fileToBase64(file);
      const report = await analyzeSwingVideo(base64Video, file.type);
      const enrichedReport = { ...report, videoUrl };
      setState(prev => ({ ...prev, isAnalyzing: false, error: null, report: enrichedReport }));
      addToHistory('analysis', enrichedReport);
      
      // Assess user skills based on new analysis
      const userProfile = ProgressService.assessUserSkill(enrichedReport);
      setState(prev => ({ ...prev, userProfile }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || "Analysis failed.", report: null }));
    }
  };

  const handleComparison = async (fileA: File, fileB: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const b64A = await fileToBase64(fileA);
      const b64B = await fileToBase64(fileB);
      const result = await compareSwings(b64A, b64B, fileA.type);
      setState(prev => ({ ...prev, isAnalyzing: false, compareReport: result }));
      addToHistory('comparison', result);
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: "Comparison failed." }));
    }
  };

  const handleComparisonWithHistory = async (historyItem: HistoryItem, fileB: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      // Extract video from history item
      const historyReport = historyItem.data as SwingReport;
      if (!historyReport.videoUrl) {
        throw new Error("No video available in history item");
      }

      // Convert video URL back to File
      const response = await fetch(historyReport.videoUrl);
      const blob = await response.blob();
      const fileA = new File([blob], `history-${historyItem.id}.mp4`, { type: blob.type });

      const b64A = await fileToBase64(fileA);
      const b64B = await fileToBase64(fileB);
      const result = await compareSwings(b64A, b64B, fileB.type);
      setState(prev => ({ ...prev, isAnalyzing: false, compareReport: result }));
      addToHistory('comparison', result);
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: "Comparison with history failed." }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const setView = (view: AppView) => setState(prev => ({ ...prev, currentView: view, selectedDrill: view === 'drill-detail' ? prev.selectedDrill : null }));

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.type === 'analysis') {
      setState(prev => ({ ...prev, currentView: 'analysis', report: item.data as SwingReport, compareReport: null }));
    } else {
      setState(prev => ({ ...prev, currentView: 'compare', compareReport: item.data as ComparativeReport, report: null }));
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setState(prev => ({ ...prev, history: prev.history.filter(i => i.id !== id) }));
  };

  const handleDrillSelect = (drill: Drill) => {
    setState(prev => ({ ...prev, currentView: 'drill-detail', selectedDrill: drill }));
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#2d2d2d]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setView('analysis')} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#cfb991] rounded flex items-center justify-center font-bold text-black">JS</div>
            <h1 className="text-xl font-oswald font-bold tracking-tight text-white uppercase">JUSTSWING AI</h1>
          </button>
          <nav className="flex space-x-4 md:space-x-8 text-sm font-medium overflow-x-auto pb-2 md:pb-0">
            {['analysis', 'drills', 'compare', 'history'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v as AppView)} 
                className={`transition-colors py-2 border-b-2 capitalize whitespace-nowrap ${state.currentView === v || (v === 'drills' && state.currentView === 'drill-detail') ? 'text-[#cfb991] border-[#cfb991]' : 'text-[#b89f73] border-transparent hover:text-[#e6d7b8]'}`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {state.currentView === 'analysis' && (
          <>
            {!state.report && !state.isAnalyzing ? (
              <div className="max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
                <h2 className="text-4xl md:text-6xl font-oswald font-bold text-white mb-6 leading-tight uppercase italic">
                  MASTER YOUR SWING WITH <span className="text-[#cfb991]">JUSTSWING AI</span>
                </h2>
                <VideoUploader onFileSelect={handleFileSelect} isProcessing={state.isAnalyzing} />
              </div>
            ) : state.isAnalyzing ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh]">
                 <div className="w-12 h-12 border-4 border-[#cfb991] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-[#cfb991] font-medium font-oswald uppercase tracking-widest">AI Coach is processing mechanics...</p>
              </div>
            ) : (
              state.report && (
              <AnalysisReport 
                report={state.report} 
                onReset={() => setState(p => ({...p, report: null}))} 
                onDrillSelect={handleDrillSelect}
                drillProgress={state.drillProgress}
              />
            )
            )}
          </>
        )}
        {state.currentView === 'drills' && (
          <DrillsLibrary 
            report={state.report} 
            onDrillSelect={handleDrillSelect}
            drillProgress={state.drillProgress}
            userProfile={state.userProfile}
          />
        )}
        {state.currentView === 'drill-detail' && state.selectedDrill && (
          <DrillDetail drill={state.selectedDrill} onBack={() => setView('drills')} />
        )}
        {state.currentView === 'compare' && (
          <ComparisonTool 
            onCompare={handleComparison} 
            onCompareWithHistory={handleComparisonWithHistory}
            isProcessing={state.isAnalyzing} 
            report={state.compareReport}
            history={state.history}
          />
        )}
        {state.currentView === 'history' && (
          <HistoryView 
            items={state.history} 
            onSelectItem={handleSelectHistoryItem} 
            onDeleteItem={handleDeleteHistoryItem}
            onDrillSelect={handleDrillSelect}
          />
        )}
      </main>

      <footer className="bg-black border-t border-[#2d2d2d] py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-500 text-sm">
          <div><h4 className="text-white font-bold mb-4 font-oswald uppercase tracking-wider">About JustSwing AI</h4><p>Professional-grade baseball analysis powered by advanced AI. High-performance mechanics tracking for serious athletes.</p></div>
          <div><h4 className="text-white font-bold mb-4 font-oswald uppercase tracking-wider">Vault Storage</h4><p>Your session history and analysis reports are saved locally in your browser's persistent storage.</p></div>
          <div><h4 className="text-white font-bold mb-4 font-oswald uppercase tracking-wider">Safety</h4><p>Always warm up before performing drills. JustSwing AI analysis is for educational purposes.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
