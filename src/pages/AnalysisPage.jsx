import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import AnalysisStage from '../components/AnalysisStage';
import { Terminal, Cpu, Network, Sparkles, FolderSync } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { 
    currentProject, 
    isAnalyzing, 
    analysisProgress, 
    currentStageIndex, 
    analysisStages, 
    analysisLogs 
  } = useProject();

  const terminalEndRef = useRef(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysisLogs]);

  // Navigate to results when analysis concludes
  useEffect(() => {
    if (!isAnalyzing && currentProject && analysisProgress === 100) {
      const timeout = setTimeout(() => {
        navigate('/results');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isAnalyzing, currentProject, analysisProgress, navigate]);

  // If no project is being analyzed, redirect to upload
  useEffect(() => {
    if (!currentProject && !isAnalyzing) {
      navigate('/upload');
    }
  }, [currentProject, isAnalyzing, navigate]);

  if (!currentProject) return null;

  return (
    <div className="relative min-h-screen bg-background text-zinc-100 pt-20 px-4 sm:px-6 lg:px-8 pb-12 overflow-hidden">
      {/* Glow Rings */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full aura-glow-1 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full aura-glow-2 translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        {/* Banner Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 text-left">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FolderSync className="w-4 h-4 animate-spin-slow" />
              <span>Active Scan Sequence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate max-w-lg">
              Analyzing: <span className="text-indigo-400 font-mono">{currentProject.name}</span>
            </h1>
          </div>
          
          {/* Progress Tracker bar */}
          <div className="shrink-0 flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Progress</p>
              <p className="text-2xl font-extrabold text-white font-mono">{analysisProgress}%</p>
            </div>
            <div className="w-32 h-2.5 bg-zinc-800/80 rounded-full overflow-hidden border border-border/50">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Left: Progression stages list */}
          <div className="lg:col-span-1 space-y-3.5 flex flex-col justify-between">
            <div className="text-left mb-1.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                <Cpu className="w-4 h-4 mr-1 text-indigo-400" />
                Pipeline Phases
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">{currentStageIndex + 1}/8 active</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {analysisStages.map((stage, idx) => (
                <AnalysisStage
                  key={stage.id}
                  stage={stage}
                  index={idx}
                  currentIndex={currentStageIndex}
                />
              ))}
            </div>
          </div>

          {/* Right: Streaming log terminals and node graphics */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Visual Graph Animation */}
            <div className="glass-panel border border-border/80 rounded-3xl p-6 h-64 flex flex-col justify-between relative overflow-hidden text-left bg-black/40">
              <div className="absolute inset-0 bg-radial-gradient-glow opacity-30 pointer-events-none" />
              <div className="flex items-center justify-between border-b border-border/30 pb-3 z-10">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Network className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Node Compilation Graph</span>
                </div>
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                </div>
              </div>

              {/* Dynamic SVG Visuals */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-[140px]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Lines drawing connecting nodes */}
                  {analysisProgress > 15 && (
                    <motion.line x1="80" y1="70" x2="220" y2="40" stroke="#4F46E5" strokeWidth="1" strokeDasharray="5,5" className="flow-line-animate" />
                  )}
                  {analysisProgress > 30 && (
                    <motion.line x1="220" y1="40" x2="350" y2="90" stroke="#6366F1" strokeWidth="1" strokeDasharray="5,5" className="flow-line-animate" />
                  )}
                  {analysisProgress > 45 && (
                    <motion.line x1="350" y1="90" x2="180" y2="120" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="5,5" className="flow-line-animate" />
                  )}
                  {analysisProgress > 60 && (
                    <motion.line x1="180" y1="120" x2="80" y2="70" stroke="#3B82F6" strokeWidth="1" strokeDasharray="5,5" className="flow-line-animate" />
                  )}
                  {analysisProgress > 75 && (
                    <motion.line x1="220" y1="40" x2="180" y2="120" stroke="#A78BFA" strokeWidth="1.5" />
                  )}

                  {/* Pulsing compiler node circles */}
                  {analysisProgress > 0 && (
                    <g>
                      <circle cx="80" cy="70" r="14" fill="#09090B" stroke="#3B82F6" strokeWidth="2" className="animate-pulse" />
                      <circle cx="80" cy="70" r="6" fill="#3B82F6" />
                    </g>
                  )}
                  {analysisProgress > 20 && (
                    <g>
                      <circle cx="220" cy="40" r="18" fill="#09090B" stroke="#6366F1" strokeWidth="2" className="animate-pulse" />
                      <circle cx="220" cy="40" r="8" fill="#6366F1" />
                    </g>
                  )}
                  {analysisProgress > 40 && (
                    <g>
                      <circle cx="350" cy="90" r="15" fill="#09090B" stroke="#8B5CF6" strokeWidth="2" className="animate-pulse" />
                      <circle cx="350" cy="90" r="6" fill="#8B5CF6" />
                    </g>
                  )}
                  {analysisProgress > 60 && (
                    <g>
                      <circle cx="180" cy="120" r="22" fill="#09090B" stroke="#A78BFA" strokeWidth="2" className="animate-pulse" />
                      <circle cx="180" cy="120" r="10" fill="#A78BFA" />
                    </g>
                  )}
                </svg>

                <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-[10px] font-bold text-zinc-500 bg-zinc-950/60 border border-border/50 px-2 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulating Force-Directed Map layout</span>
                </div>
              </div>
            </div>

            {/* Terminal Monospace stream */}
            <div className="glass-panel border border-border/80 rounded-3xl p-6 h-60 flex flex-col justify-between text-left bg-zinc-950/80 font-mono">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3 shrink-0">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Real-time AST Parser Logs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Scrolling logs container */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 text-[11px] text-zinc-400 custom-scrollbar select-none">
                {analysisLogs.map((log, index) => (
                  <div key={index} className="flex items-start leading-5">
                    <span className="text-zinc-600 mr-2 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('[SYSTEM]') ? 'text-indigo-400 font-bold' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-zinc-300'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
