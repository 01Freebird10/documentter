import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Presentation, 
  Compass, 
  ArrowLeft, 
  Download, 
  ChevronRight,
  BookOpen,
  Code2,
  Database,
  FileCheck2,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'report';

  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Keep tab updated on query changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { id: 'report', name: 'Technical Report', icon: FileCheck2 },
    { id: 'presentation', name: 'Slide Decks', icon: Presentation },
    { id: 'documentation', name: 'API Specifications', icon: Compass }
  ];

  return (
    <div className="relative min-h-screen bg-background text-zinc-100 pt-20 px-4 sm:px-6 lg:px-8 pb-12 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full aura-glow-2 opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.1]" />

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-left">
          <button 
            onClick={() => navigate('/results')} 
            className="flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Analysis Cockpit</span>
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Document Previewer</span>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex space-x-1.5 bg-zinc-900/80 border border-border/60 p-1.5 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePreviewTab"
                      className="absolute inset-0 bg-zinc-800 border border-border rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 z-10 text-indigo-400" />
                  <span className="z-10">{tab.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => alert('Downloading active PDF document...')}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Core Frame Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
          
          {/* Left Table of Contents */}
          <div className="lg:col-span-1 glass-panel border border-border/80 rounded-3xl p-5 text-left bg-black/40">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-border/30 pb-3.5 mb-4 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
              Document Index
            </h3>

            {activeTab === 'report' && (
              <ul className="space-y-3.5 text-xs font-semibold text-zinc-400">
                <li className="text-white flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>1. Executive Summary</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">2. Tech Architecture</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">3. Folder Structure Map</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">4. Controller Endpoint Logic</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">5. Database Schema blue</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">6. Security audits findings</li>
              </ul>
            )}

            {activeTab === 'presentation' && (
              <ul className="space-y-3.5 text-xs font-semibold text-zinc-400 font-mono">
                <li className="text-white flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Slide 1: Title & Purpose</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">Slide 2: Technology Stack</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">Slide 3: API Gateway</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">Slide 4: System Architecture</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">Slide 5: Database Mapping</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">Slide 6: Project Strengths</li>
              </ul>
            )}

            {activeTab === 'documentation' && (
              <ul className="space-y-3.5 text-xs font-semibold text-zinc-400">
                <li className="text-white flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>GET /api/v1/auth/status</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">POST /api/v1/projects/upload</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">GET /api/v1/projects/:id</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">POST /api/v1/documents/build</li>
                <li className="hover:text-white transition-colors cursor-pointer pl-3.5">GET /api/v1/settings/profile</li>
              </ul>
            )}
          </div>

          {/* Right Preview Sheet */}
          <div className="lg:col-span-3 min-h-[460px] bg-zinc-900 border border-border/80 rounded-3xl p-8 relative flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            
            {/* View 1: Technical Report */}
            {activeTab === 'report' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-2xl text-zinc-300 text-sm leading-relaxed"
              >
                <div className="border-b border-border/50 pb-4">
                  <h2 className="text-2xl font-extrabold text-white">1. Executive Summary</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">RepoMind AI Diagnostic Engine Reports</p>
                </div>

                <p className="font-medium">
                  This system consists of a highly optimized REST API microservices architecture designed to compile structural repositories metadata. The configuration coordinates database entities and gateway models.
                </p>

                {/* Table details mockup */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center">
                    <Database className="w-4 h-4 mr-1 text-indigo-400" />
                    Workspace Model Entities
                  </h4>
                  <table className="w-full text-left text-xs bg-zinc-950/40 rounded-xl overflow-hidden border border-border/40">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-border text-zinc-500 uppercase tracking-wider font-bold">
                        <th className="px-4 py-2.5">Field ID</th>
                        <th className="px-4 py-2.5">Data Type</th>
                        <th className="px-4 py-2.5">Constraint parameters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-white">projectId</td>
                        <td className="px-4 py-2.5">String (UUID)</td>
                        <td className="px-4 py-2.5">PRIMARY KEY, UNIQUE</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-white">name</td>
                        <td className="px-4 py-2.5">String</td>
                        <td className="px-4 py-2.5">NOT NULL, max 100 char</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-white">complexity</td>
                        <td className="px-4 py-2.5">Integer</td>
                        <td className="px-4 py-2.5">DEFAULT 0, Range 0-100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-zinc-500 italic mt-6">
                  Compiled automatically via AST module scans. Checked and encrypted under SHA-256 protocols.
                </p>
              </motion.div>
            )}

            {/* View 2: Slide Decks */}
            {activeTab === 'presentation' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Visual Slide mockup */}
                <div className="flex-1 border border-border/80 bg-zinc-950 rounded-2xl p-8 flex flex-col justify-between aspect-[16/9] shadow-inner text-left relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient-glow opacity-30 pointer-events-none" />
                  
                  <div className="flex justify-between items-center z-10 border-b border-border/40 pb-4">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">RepoMind AI Presentation</span>
                    <span className="text-[9px] text-zinc-500 font-semibold font-mono">Slide 1 of 6</span>
                  </div>

                  <div className="my-8 z-10 space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      Microservices Framework:<br />
                      <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">System Gateway Analysis</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-lg font-medium leading-relaxed">
                      Detailed review of component relationships mapping controllers logic to model databases using automated AST triggers.
                    </p>
                  </div>

                  <div className="flex justify-between items-center z-10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-t border-border/30 pt-4">
                    <span>Alex Mercer</span>
                    <span>CONFIDENTIAL - INTERNAL ONLY</span>
                  </div>
                </div>

                {/* Slides indicators controls */}
                <div className="flex justify-center space-x-2 mt-4 text-[10px] font-semibold text-zinc-400">
                  <button className="px-3 py-1 bg-zinc-950 border border-border rounded-lg hover:text-white hover:bg-zinc-800 transition-colors">Prev Slide</button>
                  <span className="py-1">Slide 1 / 6</span>
                  <button className="px-3 py-1 bg-zinc-950 border border-border rounded-lg hover:text-white hover:bg-zinc-800 transition-colors">Next Slide</button>
                </div>
              </motion.div>
            )}

            {/* View 3: API Specifications */}
            {activeTab === 'documentation' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-2xl text-xs text-zinc-300 leading-relaxed font-mono text-left"
              >
                <div className="border-b border-border/50 pb-4 font-sans">
                  <h2 className="text-2xl font-extrabold text-white">GET /api/v1/auth/status</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 font-sans">Route Specification Specifications</p>
                </div>

                <div className="space-y-1 bg-zinc-950 p-4 rounded-xl border border-border/50">
                  <p className="text-zinc-500">// Request Endpoint</p>
                  <p className="text-white font-bold"><span className="text-emerald-400">GET</span> http://localhost:5000/api/v1/auth/status</p>
                  <p className="text-zinc-500 mt-3">// Request Headers</p>
                  <p className="text-zinc-300">Authorization: Bearer &lt;JSON_WEB_TOKEN&gt;</p>
                </div>

                <div className="space-y-1 bg-zinc-950 p-4 rounded-xl border border-border/50">
                  <p className="text-zinc-500">// Response Payload (200 OK)</p>
                  <pre className="text-indigo-300 overflow-x-auto text-[10px]">
{`{
  "status": "success",
  "data": {
    "connection": "authorized",
    "userId": "usr_77a98bc19",
    "timestamp": "2026-05-30T10:11:57.022Z",
    "roles": ["developer", "administrator"]
  }
}`}
                  </pre>
                </div>

                <div className="space-y-1.5 font-sans pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center">
                    <Code2 className="w-4 h-4 mr-1 text-indigo-400" />
                    Query Parameters
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium">None required. Authorization header must be a authenticated token validator string.</p>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
