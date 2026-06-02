import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { 
  UploadCloud, 
  ArrowRight, 
  FolderGit2, 
  FileText, 
  Calendar, 
  Layers, 
  Trash2,
  AlertCircle,
  Sparkles,
  Link2,
  RefreshCw
} from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const navigate = useNavigate();
  const { 
    uploadZipFile, 
    connectGitHubRepo, 
    history, 
    selectProjectFromHistory,
    githubDetails,
    syncGitHubRepository
  } = useProject();

  const [dragActive, setDragActive] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [loadingType, setLoadingType] = useState(null); // 'zip' or 'github'
  const fileInputRef = useRef(null);

  // New GitHub selectors
  const [manualGitToggle, setManualGitToggle] = useState(false);
  const [selectedRepoName, setSelectedRepoName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        processZipFile(file);
      } else {
        alert('Please upload a ZIP file archive.');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        processZipFile(file);
      } else {
        alert('Please upload a ZIP file archive.');
      }
    }
  };

  const processZipFile = (file) => {
    setLoadingType('zip');
    // Simulate minor compression delay before redirecting to dynamic analyzer
    setTimeout(() => {
      uploadZipFile(file);
      navigate('/analyze');
    }, 1200);
  };

  const handleGitSubmit = (e) => {
    e.preventDefault();
    if (!gitUrl) return;

    // Direct simple validation of repo address
    const gitReg = /github\.com\/[\w-]+\/[\w.-]+/;
    if (!gitReg.test(gitUrl)) {
      setIsUrlValid(false);
      return;
    }

    setIsUrlValid(true);
    setLoadingType('github');
    
    setTimeout(() => {
      connectGitHubRepo(gitUrl);
      navigate('/analyze');
    }, 1200);
  };

  const handleMonitoredRepoSubmit = (e) => {
    e.preventDefault();
    if (!selectedRepoName) return;

    setLoadingType('github');
    setTimeout(() => {
      syncGitHubRepository(selectedRepoName, selectedBranch);
      navigate('/analyze');
    }, 1200);
  };

  const handleHistoryClick = (proj) => {
    selectProjectFromHistory(proj);
    navigate('/results');
  };

  return (
    <div className="relative min-h-screen bg-background text-zinc-100 pt-20 px-4 sm:px-6 lg:px-8 pb-12 overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] rounded-full aura-glow-1 -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />

      <div className="max-w-4xl mx-auto z-10 relative space-y-10">
        
        {/* Upper Heading */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Analyze Your Codebase
          </h1>
          <p className="max-w-xl mx-auto text-sm text-zinc-400 font-medium leading-relaxed">
            Feed RepoMind AI with your project folder files or link direct pipelines. Watch it compile deep AST layouts, metrics, and PDFs.
          </p>
        </div>

        {/* Drag and Drop Box & Git connector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* ZIP Drop Zone */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="text-left mb-2.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Zip File Ingest</h3>
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                  : 'border-zinc-800 bg-[#111113]/50 hover:bg-[#111113] hover:border-zinc-700'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {loadingType === 'zip' ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-white">Extracting archives...</p>
                    <p className="text-xs text-zinc-500 mt-1">Preparing compiler modules</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-zinc-900 border border-border mb-4 text-indigo-400 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Drag & Drop ZIP file</h3>
                  <p className="text-xs text-zinc-400 font-medium mb-1">or click to browse your system</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Max size: 100MB</p>
                </>
              )}
            </div>
          </motion.div>

          {/* GitHub Input Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="text-left mb-2.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Direct Git Connection</h3>
            </div>

            <div className="flex-1 glass-panel border border-border/80 rounded-3xl p-8 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-zinc-900 border border-border text-zinc-300">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Repository Link</h3>
                    <p className="text-xs text-zinc-500">
                      {githubDetails.isConnected && !manualGitToggle 
                        ? 'Select linked project repository' 
                        : 'Provide direct public GitHub URL'}
                    </p>
                  </div>
                </div>

                {/* Switch between Connected repo selector and manual URL entry */}
                {githubDetails.isConnected && !manualGitToggle ? (
                  <form onSubmit={handleMonitoredRepoSubmit} className="space-y-4 animate-fade-in">
                    {githubDetails.syncedRepos.length === 0 ? (
                      <div className="p-4 bg-zinc-950 border border-border rounded-2xl space-y-3 text-xs text-zinc-400 font-semibold leading-relaxed">
                        <div className="flex items-start space-x-2 text-indigo-400">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>No synced repositories linked.</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium leading-normal">
                          Go to <strong>Settings → GitHub Integration</strong> to search and import repositories under your account, or choose manual URL entry below.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Monitored Repository</label>
                          <select
                            value={selectedRepoName}
                            onChange={(e) => setSelectedRepoName(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          >
                            <option value="">-- Choose Repository --</option>
                            {githubDetails.syncedRepos.map(repo => (
                              <option key={repo.id} value={repo.name}>{repo.fullName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Branch Choices</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          >
                            <option value="main">main</option>
                            <option value="master">master</option>
                            <option value="prod">prod</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setManualGitToggle(true)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center justify-center mx-auto space-x-1"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Or Enter Git URL Manually</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleGitSubmit} className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">GitHub URL</label>
                      <input
                        type="text"
                        value={gitUrl}
                        onChange={(e) => {
                          setGitUrl(e.target.value);
                          setIsUrlValid(true);
                        }}
                        placeholder="https://github.com/username/project"
                        className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
                          isUrlValid 
                            ? 'border-border focus:border-indigo-500 focus:ring-indigo-500' 
                            : 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500'
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {!isUrlValid && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center space-x-2 text-xs text-rose-400 font-semibold"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Invalid GitHub URL structure.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {githubDetails.isConnected && (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setManualGitToggle(false)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center justify-center mx-auto space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Browse Linked Repositories</span>
                        </button>
                      </div>
                    )}

                    {!githubDetails.isConnected && (
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-start space-x-2 text-[9px] font-semibold text-zinc-400">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>Private or Org Repositories? Connect your GitHub OAuth account inside Settings to unlock linked scans.</span>
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800/40">
                {githubDetails.isConnected && !manualGitToggle ? (
                  <button
                    onClick={handleMonitoredRepoSubmit}
                    disabled={loadingType === 'github' || !selectedRepoName}
                    className="w-full relative group py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {loadingType === 'github' ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sync & Analyze Repo</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleGitSubmit}
                    disabled={loadingType === 'github' || !gitUrl}
                    className="w-full relative group py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {loadingType === 'github' ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Clone & Analyze URL</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Analyzed Projects */}
        <div className="text-left space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Recent Projects</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {history.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleHistoryClick(proj)}
                className="glass-panel glass-panel-hover rounded-2xl p-5 text-left cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                      proj.type === 'github' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700/60' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {proj.type === 'github' ? 'GitHub' : 'ZIP'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {proj.date.split(' ')[0]}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 truncate" title={proj.name}>
                    {proj.name}
                  </h4>

                  {/* Stack Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.techStack.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-border/40 text-[9px] text-zinc-400 font-semibold">
                        {t}
                      </span>
                    ))}
                    {proj.techStack.length > 3 && (
                      <span className="px-1 py-0.5 rounded bg-zinc-900 border border-border/40 text-[8px] text-zinc-500 font-extrabold">
                        +{proj.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-zinc-800/40 pt-3">
                  <span className="text-zinc-500 font-medium">Complexity Rating</span>
                  <span className="font-mono font-bold text-indigo-400">{proj.rating} ({proj.complexityScore})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
