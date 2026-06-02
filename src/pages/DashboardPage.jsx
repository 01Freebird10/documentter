import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import Sidebar from '../components/Sidebar';
import { 
  BarChart3, 
  FolderGit2, 
  History, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { history, selectProjectFromHistory } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Numerical statistics
  const stats = [
    { label: 'Analyses Run', val: '12', sub: '+2 this week', icon: FolderGit2, color: 'text-blue-400' },
    { label: 'Documents Compiled', val: '74', sub: 'PDF, DOCX, PPTX', icon: FileText, color: 'text-indigo-400' },
    { label: 'Tech Libraries Scanned', val: '9', sub: 'Node, React, PyTorch', icon: Cpu, color: 'text-violet-400' },
    { label: 'Avg Complexity Rating', val: '88.3%', sub: 'Grade: A+', icon: TrendingUp, color: 'text-emerald-400' }
  ];

  const handleProjectClick = (proj) => {
    selectProjectFromHistory(proj);
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* collapsible Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div 
        className="flex-1 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 76 : 260 }}
      >
        <div className="max-w-5xl mx-auto space-y-8 text-left">
          
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Operating System Core</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Developer Workspace Cockpit
              </h1>
            </div>
            
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all"
            >
              <span>Analyze New Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Statistics widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s, index) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass-panel border border-border/70 rounded-2xl p-5 text-left flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-extrabold text-white font-mono mt-1">{s.val}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg bg-zinc-900 border border-border/60 ${s.color}`}>
                    <s.icon className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="border-t border-zinc-800/40 my-3" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">{s.sub}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions & Connection Key widget split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Quick Actions */}
            <div className="md:col-span-2 glass-panel border border-border/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-border/30 pb-3 mb-4">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Quick Shortcuts</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => navigate('/upload')}
                    className="p-4 bg-zinc-900/50 border border-border/60 rounded-xl hover:border-indigo-500/40 hover:bg-zinc-900 transition-all cursor-pointer flex justify-between items-center text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-white mb-0.5">Zip Folder</p>
                      <p className="text-[10px] text-zinc-500 leading-normal font-medium">Extract local ZIP package assets</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" />
                  </div>

                  <div 
                    onClick={() => navigate('/upload')}
                    className="p-4 bg-zinc-900/50 border border-border/60 rounded-xl hover:border-indigo-500/40 hover:bg-zinc-900 transition-all cursor-pointer flex justify-between items-center text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-white mb-0.5">GitHub Repository</p>
                      <p className="text-[10px] text-zinc-500 leading-normal font-medium">Link direct public clone paths</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800/40 pt-4 mt-6 flex justify-between items-center text-[10px] font-semibold text-zinc-500">
                <span>Active API Engine Nodes: 4 online</span>
                <span className="text-indigo-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  SHA-256 Encrypted
                </span>
              </div>
            </div>

            {/* Connection Status widget */}
            <div className="md:col-span-1 glass-panel border border-border/80 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-border/30 pb-3 mb-4">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">API Gateway Auth</h4>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Your account is currently synced with the RepoMind AI cloud parser node.
                  </p>
                  
                  <div className="bg-zinc-900 border border-border/60 px-3.5 py-2.5 rounded-xl font-mono text-[10px] text-zinc-500 truncate flex items-center justify-between">
                    <span>sk_repomind_••••••••••••••</span>
                    <span className="text-emerald-400 font-sans font-bold">Active</span>
                  </div>
                </div>
              </div>

              <span 
                onClick={() => navigate('/settings')}
                className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider cursor-pointer hover:text-indigo-300 transition-colors mt-4 text-left inline-block"
              >
                Manage API Keys →
              </span>
            </div>
          </div>

          {/* Recent History Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
              <History className="w-4 h-4 mr-1 text-indigo-400" />
              Recent codebase analyses history
            </h3>

            <div className="glass-panel border border-border/80 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="bg-zinc-950 border-b border-border/60 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="px-6 py-4">Workspace / Project</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Stack parameters</th>
                    <th className="px-6 py-4">Analyzed</th>
                    <th className="px-6 py-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {history.map((proj) => (
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
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
