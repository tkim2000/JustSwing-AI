
import React from 'react';
import { Drill } from '../types';

interface DrillDetailProps {
  drill: Drill;
  onBack: () => void;
}

const DrillDetail: React.FC<DrillDetailProps> = ({ drill, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <button 
        onClick={onBack}
        className="flex items-center text-emerald-500 font-bold uppercase text-xs tracking-widest mb-8 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Training
      </button>

      <div className="bg-slate-800/40 border border-slate-700 rounded-3xl overflow-hidden">
        <div className="p-8 md:p-12">
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/30">
                Focus: {drill.category}
              </span>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border 
                ${drill.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                  drill.difficulty === 'Intermediate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                  'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {drill.difficulty}
              </span>
              <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-600">
                {drill.duration}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-oswald font-bold text-white mb-6 uppercase italic leading-tight">
              {drill.title}
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed font-medium border-l-4 border-emerald-500 pl-6">
              {drill.description}
            </p>
          </header>

          <section className="space-y-12">
            <div>
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span className="w-8 h-[1px] bg-emerald-500/30 mr-4"></span>
                Step-by-Step Guide
              </h3>
              <div className="space-y-8">
                {drill.steps.map((step, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-500 font-oswald text-xl group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all duration-300">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-slate-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Coach's Tip</h4>
              <p className="text-slate-400 italic text-sm">
                Focus on the quality of movement over speed. If you feel your mechanics breaking down, slow down the tempo until you regain control of the movement pattern.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
        >
          I've Completed This Drill
        </button>
      </div>
    </div>
  );
};

export default DrillDetail;
