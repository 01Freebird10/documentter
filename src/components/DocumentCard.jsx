import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { 
  FileText, 
  Presentation, 
  GraduationCap, 
  TrendingUp, 
  Compass, 
  Download, 
  RotateCw, 
  Eye, 
  CheckCheck,
  FileCheck2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentCard({ doc }) {
  const navigate = useNavigate();
  const { regeneratingAssets, triggerRegenerate } = useProject();
  
  const isRegenerating = regeneratingAssets[doc.id];

  const iconMap = {
    docx: FileCheck2,
    pdf: FileText,
    pptx: Presentation,
    viva: GraduationCap,
    resume: TrendingUp,
    tech: Compass
  };

  const Icon = iconMap[doc.iconType] || FileText;

  const handlePreview = () => {
    navigate(`/preview?tab=${doc.tabName || 'report'}`);
  };

  const handleDownload = () => {
    alert(`Initiating download for ${doc.fileName}...`);
  };

  return (
    <div className={`glass-panel border rounded-3xl p-6 text-left relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
      isRegenerating 
        ? 'border-indigo-500/50 bg-indigo-500/5 scale-[0.99] blur-[0.5px]' 
        : 'border-border/80 hover:border-zinc-700'
    }`}>
      
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-zinc-900 border border-border/80 ${
            doc.iconType === 'pdf' ? 'text-emerald-400' : doc.iconType === 'pptx' ? 'text-amber-400' : 'text-indigo-400'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {isRegenerating ? (
            <span className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Regenerating...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready</span>
            </span>
          )}
        </div>

        {/* Labels */}
        <h4 className="text-sm font-bold text-white mb-1.5 truncate">{doc.title}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-4">{doc.desc}</p>
      </div>

      {/* Statistics info & Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-t border-b border-zinc-800/40 py-2 text-[10px] font-semibold">
          <span className="text-zinc-500">FORMAT: <span className="font-mono text-zinc-300 font-bold">{doc.format}</span></span>
          <span className="text-zinc-500">{doc.statLabel}: <span className="font-mono text-zinc-300 font-bold">{doc.statValue}</span></span>
        </div>

        {/* Buttons Controls */}
        <div className="grid grid-cols-3 gap-2">
          {/* Preview */}
          <button
            onClick={handlePreview}
            disabled={isRegenerating}
            className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900 border border-border hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
            title="Preview Asset"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isRegenerating}
            className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900 border border-border hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
            title="Download Asset"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Regenerate */}
          <button
            onClick={() => triggerRegenerate(doc.id)}
            disabled={isRegenerating}
            className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900 border border-border hover:bg-zinc-850 hover:border-indigo-500/50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-indigo-400 transition-colors disabled:opacity-50"
            title="Regenerate Asset"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

    </div>
  );
}
