import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function AnalysisStage({ stage, index, currentIndex }) {
  const isCompleted = index < currentIndex;
  const isActive = index === currentIndex;
  const isPending = index > currentIndex;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
      isActive 
        ? 'glass-panel border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
        : isCompleted 
          ? 'bg-zinc-900/40 border-emerald-500/20 text-zinc-400' 
          : 'bg-zinc-900/20 border-border/40 text-zinc-600'
    }`}>
      <div className="flex items-center space-x-3.5 text-left">
        {/* State Indicator Icon */}
        <div className="shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isActive ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping absolute" />
              <Clock className="w-5 h-5 text-indigo-400 relative z-10 animate-pulse" />
            </div>
          ) : (
            <Circle className="w-5 h-5 text-zinc-700" />
          )}
        </div>

        {/* Labels */}
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {stage.label}
          </h4>
          {isActive && (
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mt-0.5 animate-pulse">
              Analyzing active script logs...
            </p>
          )}
        </div>
      </div>

      {/* Numerical percentage tracker */}
      {isActive && (
        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
          In Progress
        </span>
      )}
      {isCompleted && (
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
          Complete
        </span>
      )}
      {isPending && (
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Queued
        </span>
      )}
    </div>
  );
}
