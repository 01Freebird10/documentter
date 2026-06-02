import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import Sidebar from '../components/Sidebar';
import { History, Calendar, Search, ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, selectProjectFromHistory } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = history.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleProjectClick = (proj) => {
    selectProjectFromHistory(proj);
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div 
        className="flex-1 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 76 : 260 }}
      >
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="border-b border-border/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Archive Ledger</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Analysis History
              </h1>
            </div>
            
            {/* Search Box */}
            <div className="relative shrink-0 w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search archive..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="glass-panel border border-border/80 rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead>
                <tr className="bg-zinc-950 border-b border-border/60 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="px-6 py-4">Workspace / Project</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Stack parameters</th>
                  <th className="px-6 py-4">Analyzed Date</th>
                  <th className="px-6 py-4">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filtered.map((proj) => (
                  <tr 
                    key={proj.id}
                    onClick={() => handleProjectClick(proj)}
                    className="hover:bg-zinc-900/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-white truncate max-w-[200px]" title={proj.name}>
                      {proj.name}
                    </td>
                    <td className="px-6 py-4 uppercase">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                        proj.type === 'github' ? 'bg-zinc-900 border border-border text-zinc-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {proj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.techStack.map((tech) => (
                          <span key={tech} className="px-1.5 py-0.5 bg-zinc-900 border border-border/40 rounded text-[9px] font-semibold text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">
                      {proj.date}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">
                      {proj.rating} ({proj.complexityScore})
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                      No matching parsed projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
