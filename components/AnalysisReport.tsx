import React, { useRef, useEffect, useState } from 'react';
import { Drill, SwingReport, SwingPhaseAnalysis, DrillProgress } from '../types';
import { ALL_DRILLS } from './DrillsLibrary';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// Import DrillCard component (we'll define it inline to avoid circular imports)
const DrillCard: React.FC<{ 
  drill: Drill; 
  onClick: () => void;
  progress?: DrillProgress;
}> = ({ drill, onClick, progress }) => {

  return (
    <>
      <div 
        onClick={onClick}
        className="bg-slate-900/60 border border-emerald-500/20 p-5 rounded-2xl text-left transition-all group hover:border-emerald-500 cursor-pointer hover:bg-slate-800 w-full"
      >
        {/* Progress indicator */}
        {progress && progress.sessions && progress.sessions.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
            <div className="bg-emerald-500 text-emerald-900 px-2 py-1 rounded text-xs font-bold">
              COMPLETED
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-emerald-500 font-medium">
                {progress.sessions.length} session{progress.sessions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
            {progress && progress.sessions && progress.sessions.length > 0 ? 'Completed' : 'Fix: Action Plan'}
          </span>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <h4 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{drill.title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">{drill.description}</p>
        <div className="flex items-center text-xs text-slate-500 font-bold uppercase">
          Learn More
        </div>
      </div>
    </>
  );
};

// Enhanced drill matching system (same as DrillsLibrary)
const DRILL_KEYWORD_MAP: Record<string, string[]> = {
  'stride': ['stride freeze', 'walking happy gilmore'],
  'balance': ['balance beam', 'closed eyes', 'narrow stance'],
  'load': ['stride freeze', 'walking happy gilmore', 'variable timing'],
  'timing': ['variable timing', 'quick hands'],
  'path': ['stop at contact', 'knee down tee', 'top hand', 'bottom hand', 'towel drill', 'follow through'],
  'power': ['med ball toss', 'weighted bat', 'quick hands', 'resistance band'],
  'hand': ['top hand', 'bottom hand', 'quick hands'],
  'stance': ['narrow stance', 'mirror work', 'two-ball toss', 'chair drill'],
  'extension': ['follow through', 'stop at contact'],
  'mechanics': ['mirror work', 'stop at contact', 'towel drill'],
  'rhythm': ['walking happy gilmore', 'variable timing'],
  'speed': ['quick hands', 'weighted bat'],
  'strength': ['med ball toss', 'resistance band', 'weighted bat'],
  'posture': ['balance beam', 'mirror work', 'narrow stance'],
  'sequence': ['stride freeze', 'walking happy gilmore'],
  'recognition': ['two-ball toss'],
  'feel': ['closed eyes', 'mirror work'],
  'connection': ['towel drill', 'chair drill']
};

const findMatchingDrill = (suggestedDrillName: string): Drill | null => {
  const suggestionLower = suggestedDrillName.toLowerCase();
  
  // Direct string matching
  for (const drill of ALL_DRILLS) {
    if (drill.title.toLowerCase().includes(suggestionLower) || 
        suggestionLower.includes(drill.title.toLowerCase())) {
      return drill;
    }
  }

  // Keyword matching
  for (const [keyword, relatedDrills] of Object.entries(DRILL_KEYWORD_MAP)) {
    if (suggestionLower.includes(keyword)) {
      for (const drillTitle of relatedDrills) {
        const drill = ALL_DRILLS.find(d => 
          d.title.toLowerCase().includes(drillTitle)
        );
        if (drill) return drill;
      }
    }
  }

  return null;
};

interface AnalysisReportProps {
  report: SwingReport;
  onReset: () => void;
  onDrillSelect: (drill: Drill) => void;
  drillProgress: DrillProgress[];
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, onReset, onDrillSelect, drillProgress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const chartData = [
    { subject: 'Stance', A: report.metrics.stance.score, fullMark: 100 },
    { subject: 'Load', A: report.metrics.load.score, fullMark: 100 },
    { subject: 'Path', A: report.metrics.path.score, fullMark: 100 },
    { subject: 'Finish', A: report.metrics.followThrough.score, fullMark: 100 },
    { subject: 'Overall', A: report.overallScore, fullMark: 100 },
  ];

  const handleSeek = (timestamp?: string) => {
    if (!videoRef.current || !timestamp) return;
    const [mins, secs] = timestamp.split(':').map(Number);
    videoRef.current.currentTime = mins * 60 + secs;
    videoRef.current.play();
  };

  const allPrescribedDrillItems = (Object.entries(report.metrics) as [string, SwingPhaseAnalysis][])
    .flatMap(([phase, data]) => {
      return data.drills.map(drillName => {
        // Use the enhanced matching system first
        const drillObj = findMatchingDrill(drillName);

        if (!drillObj) {
          // Fallback to generic drill generation
          const fallbackDrill = {
            id: `gen-${drillName.toLowerCase().replace(/\s+/g, '-')}`,
            title: drillName,
            description: `A targeted corrective drill specifically suggested by AI Coach to improve your ${phase} mechanics.`,
            steps: [
              "Review the feedback in your analysis regarding this phase.",
              "Setup in a controlled environment (tee or soft toss).",
              "Execute the movement at 50% speed, focusing on the mechanical correction.",
              "Gradually increase speed as the feeling becomes natural.",
              "Complete 20 repetitions focused on quality over power."
            ],
            category: 'Path',
            difficulty: 'Intermediate',
            duration: '15 mins'
          };
          return { name: drillName, phase, drillObj: fallbackDrill };
        }

        return { name: drillName, phase, drillObj };
      });
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Film Room & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Video & Radar */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video relative group">
            <video 
              ref={videoRef}
              src={report.videoUrl} 
              className="w-full h-full object-contain"
              controls
            />
            <div className="absolute top-4 left-4 bg-emerald-600/90 text-white px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">
              Film Room Analysis
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Overall</span>
              <span className="text-3xl font-oswald text-emerald-500">{report.overallScore}</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Bat Speed</span>
              <span className="text-2xl font-oswald text-white">{report.estimatedStats.batSpeed}</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Exit Velo</span>
              <span className="text-2xl font-oswald text-white">{report.estimatedStats.exitVelocity}</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Launch</span>
              <span className="text-2xl font-oswald text-white">{report.estimatedStats.launchAngle}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Swing Profile Chart */}
        <div className="lg:col-span-4 bg-slate-800/30 border border-slate-700 rounded-3xl p-6 flex flex-col">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Swing Profile</h3>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Swing"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-emerald-500/20">
             <p className="text-slate-300 text-sm italic leading-relaxed">"{report.summary}"</p>
          </div>
        </div>
      </div>

      {/* Frame-by-Frame Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center">
            <span className="w-2 h-6 bg-emerald-500 rounded mr-3"></span>
            Biomechanical Breakdown
          </h3>
          <div className="space-y-10">
            {(Object.entries(report.metrics) as [string, SwingPhaseAnalysis][]).map(([key, phase]) => (
              <div key={key} className="relative pl-8 border-l border-slate-700 pb-2 last:pb-0">
                <button 
                  onClick={() => handleSeek(phase.timestamp)}
                  className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-900 border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-500 font-bold hover:bg-emerald-500 hover:text-slate-900 transition-colors"
                  title="Seek to moment"
                >
                  {phase.timestamp || "•"}
                </button>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-bold capitalize tracking-wide flex items-center">
                    {key} Phase
                    {phase.timestamp && (
                      <span className="ml-3 text-[10px] bg-slate-900 px-2 py-0.5 rounded text-emerald-500 font-mono">@{phase.timestamp}</span>
                    )}
                  </h4>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${phase.score > 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                    {phase.score}/100
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{phase.feedback}</p>
                <div className="w-full bg-slate-700/30 h-1 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${phase.score > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${phase.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Red Flags & Fixes */}
        <div className="space-y-6">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6">
            <h3 className="text-sm font-black text-orange-500 uppercase tracking-[0.2em] mb-6 flex items-center">
              Mechanical Flaws
            </h3>
            <div className="space-y-4">
              {report.keyIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-orange-500/10">
                  <span className="text-orange-500 mr-3 font-bold">!</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={onReset}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span>Analyze Another Swing</span>
          </button>
        </div>
      </div>

      {/* ACTION PLAN */}
      <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8">
        <h3 className="text-2xl font-oswald font-bold text-white italic tracking-tight uppercase mb-8">Coach's Action Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPrescribedDrillItems.length > 0 ? allPrescribedDrillItems.map((item, idx) => {
            const progress = drillProgress.find(p => p.drillId === item.drillObj.id);
            return (
              <DrillCard
                key={idx}
                drill={item.drillObj}
                onClick={() => onDrillSelect(item.drillObj)}
                progress={progress}
              />
            );
          }) : (
            <p className="text-slate-500 italic">No specific drills prescribed.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalysisReport;
