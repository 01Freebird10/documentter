import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Code2, 
  Sparkles, 
  Cpu, 
  Terminal, 
  FileJson, 
  CheckCircle2, 
  FileText, 
  Presentation, 
  GraduationCap, 
  Compass, 
  Gauge,
  Layers,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  X
} from 'lucide-react';
import { FolderZip, Github } from '../components/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  // Features Mock data
  const features = [
    { 
      title: 'Deep Code Analysis', 
      desc: 'Parses your complete abstract syntax tree (AST) to extract class models and operational paths.', 
      icon: Code2, 
      color: 'text-blue-400',
      glow: 'shadow-blue-500/10'
    },
    { 
      title: 'AI Project Reports', 
      desc: 'Generates detailed high-level overviews summarizing application purpose and architectural pipelines.', 
      icon: Sparkles, 
      color: 'text-indigo-400',
      glow: 'shadow-indigo-500/10'
    },
    { 
      title: 'PowerPoint Decks', 
      desc: 'Automates presentation decks showing system components, stack parameters, and database structures.', 
      icon: Presentation, 
      color: 'text-violet-400',
      glow: 'shadow-violet-500/10'
    },
    { 
      title: 'Resume Optimization', 
      desc: 'Transforms structural workspace elements into targeted resume highlights showcasing core engineering impact.', 
      icon: TrendingUp, 
      color: 'text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    { 
      title: 'Viva Q&A Generator', 
      desc: 'Creates a exhaustive database of defense and review questions based strictly on your custom code scripts.', 
      icon: GraduationCap, 
      color: 'text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    { 
      title: 'Architecture Mapping', 
      desc: 'Draws responsive graphical network schemas tracing routes, database entries, and component bonds.', 
      icon: Compass, 
      color: 'text-pink-400',
      glow: 'shadow-pink-500/10'
    },
    { 
      title: 'GitHub Repositories', 
      desc: 'Direct repository cloning via simple links to map systems without downloading folders locally.', 
      icon: Github, 
      color: 'text-cyan-400',
      glow: 'shadow-cyan-500/10'
    },
    { 
      title: 'Complexity Scoring', 
      desc: 'Grades overall application parameters (lines, depth, duplication) yielding clear architectural scores.', 
      icon: Gauge, 
      color: 'text-rose-400',
      glow: 'shadow-rose-500/10'
    }
  ];

  // Steps data
  const steps = [
    { num: '01', title: 'Upload Folder', desc: 'Drag and drop your ZIP archive or paste your GitHub repository URL.' },
    { num: '02', title: 'AI Analysis', desc: 'RepoMind AI maps components, logic flow, architectures, and tech libraries.' },
    { num: '03', title: 'Generate Assets', desc: 'Choose output packages: technical docs, PPT slides, or mock defense sheets.' },
    { num: '04', title: 'Download Reports', desc: 'Secure one-click packaging formats: PDF, DOCX, PPTX, and HTML summaries.' }
  ];

  // Pricing data
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      desc: 'Test the waters of automated codebase blueprinting.',
      features: ['Up to 3 small projects', 'Max 25 files per upload', 'Standard PDF Technical Reports', 'Basic stack diagnostics'],
      cta: 'Start Analyzing',
      highlight: false,
      href: '/upload'
    },
    {
      name: 'Professional',
      price: '$29',
      desc: 'The complete software architect cockpit for engineers.',
      features: ['Unlimited zip uploads', 'GitHub Direct clone connector', 'PowerPoint slides compilation', 'Viva review sheets generator', 'Dynamic SVG Architecture Map', 'Resume description builder', 'Priority AI scheduling'],
      cta: 'Get Premium Access',
      highlight: true,
      href: '/upload'
    },
    {
      name: 'Enterprise Team',
      price: '$99',
      desc: 'SaaS code diagnostic suites for developer agencies.',
      features: ['Multi-member collaborative accounts', 'Extended repository sizes (100MB+)', 'Custom brand PDF/DOCX templates', 'API integrations', 'SLA support contracts', 'Dedicated LLM secure sandbox'],
      cta: 'Contact Sales',
      highlight: false,
      href: '/login'
    }
  ];

  return (
    <div className="relative bg-background min-h-screen text-zinc-100 overflow-x-hidden pt-16">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full aura-glow-1 -translate-y-1/3 opacity-80" />
      <div className="absolute top-[1000px] left-[-200px] w-[500px] h-[500px] rounded-full aura-glow-2 opacity-50" />
      <div className="absolute bottom-[200px] right-[-100px] w-[600px] h-[600px] rounded-full aura-glow-1 opacity-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />

      {/* Floating particles background container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-particle w-1.5 h-1.5 left-1/4 top-1/4 animate-float" style={{ animationDelay: '0s' }} />
        <div className="floating-particle w-2 h-2 left-3/4 top-1/3 animate-float" style={{ animationDelay: '3s' }} />
        <div className="floating-particle w-1 h-1 left-1/3 top-2/3 animate-float" style={{ animationDelay: '7s' }} />
        <div className="floating-particle w-2.5 h-2.5 left-2/3 top-3/4 animate-float" style={{ animationDelay: '10s' }} />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-left"
        >
          {/* Version badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold tracking-wide text-indigo-400 mb-6 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RepoMind v2.6 Core Launched</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Transform Any Codebase Into <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Professional Documentation
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed">
            Upload your project ZIP folder or paste a GitHub repository link. Our AI structural core generates reports, PowerPoint decks, system architecture diagrams, and comprehensive viva review lists instantly.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/upload"
              className="relative group px-6 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl flex items-center space-x-2 active:scale-95 transition-transform"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span>Analyze Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowDemo(true)}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-zinc-900 border border-border hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current text-zinc-300" />
              <span>Watch Demo</span>
            </button>
          </div>
        </motion.div>

        {/* Hero Visual: Continuous Interactive Flow Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-xl lg:max-w-lg glass-panel border border-border/80 p-8 rounded-3xl relative flex flex-col items-center justify-between min-h-[380px] shadow-2xl overflow-hidden"
        >
          {/* SVG Pipeline */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Top folder to brain line */}
            <path d="M 120 100 Q 240 100 240 180" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" className="flow-line-animate" />
            
            {/* Bottom URL input to brain line */}
            <path d="M 120 280 Q 240 280 240 200" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" className="flow-line-animate" />
            
            {/* Brain to Doc lines */}
            <path d="M 280 190 Q 380 100 380 100" fill="none" stroke="url(#lineGradient2)" strokeWidth="1.5" className="flow-line-animate" />
            <path d="M 280 190 Q 380 160 380 160" fill="none" stroke="url(#lineGradient2)" strokeWidth="1.5" className="flow-line-animate" />
            <path d="M 280 190 Q 380 220 380 220" fill="none" stroke="url(#lineGradient2)" strokeWidth="1.5" className="flow-line-animate" />
            <path d="M 280 190 Q 380 280 380 280" fill="none" stroke="url(#lineGradient2)" strokeWidth="1.5" className="flow-line-animate" />

            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Left: Input Nodes */}
          <div className="absolute left-6 top-10 flex flex-col space-y-24 z-10">
            {/* File Ingest */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2.5 rounded-xl shadow-lg hover:border-blue-500/50 transition-colors">
              <FolderZip className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">ZIP Folder</p>
                <p className="text-[10px] text-zinc-500">Local codebase</p>
              </div>
            </div>

            {/* Git Link Ingest */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2.5 rounded-xl shadow-lg hover:border-blue-500/50 transition-colors">
              <Github className="w-5 h-5 text-zinc-300" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">GitHub URL</p>
                <p className="text-[10px] text-zinc-500">Direct clone link</p>
              </div>
            </div>
          </div>

          {/* Center: AI Brain Core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 p-[1.5px] shadow-[0_0_40px_rgba(99,102,241,0.25)]">
              <div className="w-full h-full bg-[#111113] rounded-full flex items-center justify-center animate-pulse-slow">
                <Cpu className="w-7 h-7 text-indigo-400 animate-spin-slow" />
              </div>
              {/* Outer pulsing ring */}
              <div className="absolute inset-[-4px] border border-indigo-500/30 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-3">AI Engine</p>
          </div>

          {/* Right: Output Nodes */}
          <div className="absolute right-6 top-6 flex flex-col space-y-10 z-10 text-right">
            {/* DOCX */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2 rounded-xl shadow-lg hover:border-violet-500/50 transition-colors">
              <div className="text-right">
                <p className="text-xs font-semibold text-white">DOCX Blueprint</p>
                <p className="text-[10px] text-zinc-500">Detailed Report</p>
              </div>
              <FileCheck2 className="w-5 h-5 text-blue-400" />
            </div>

            {/* PDF */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2 rounded-xl shadow-lg hover:border-violet-500/50 transition-colors">
              <div className="text-right">
                <p className="text-xs font-semibold text-white">PDF Specs</p>
                <p className="text-[10px] text-zinc-500">Tech Architecture</p>
              </div>
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>

            {/* PPT */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2 rounded-xl shadow-lg hover:border-violet-500/50 transition-colors">
              <div className="text-right">
                <p className="text-xs font-semibold text-white">PPTX Presentation</p>
                <p className="text-[10px] text-zinc-500">Slide outlines</p>
              </div>
              <Presentation className="w-5 h-5 text-amber-400" />
            </div>

            {/* Technical Docs */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-border/80 px-4 py-2 rounded-xl shadow-lg hover:border-violet-500/50 transition-colors">
              <div className="text-right">
                <p className="text-xs font-semibold text-white">Interactive Graph</p>
                <p className="text-[10px] text-zinc-500">3D Route Maps</p>
              </div>
              <Compass className="w-5 h-5 text-pink-400" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Premium Features for Advanced Systems
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-zinc-400 font-medium">
            Everything you need to digest, explain, outline, and analyze any directory of scripts.
          </p>
        </div>

        {/* Responsive Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass-panel glass-panel-hover rounded-2xl p-6 text-left relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Icon wrapper */}
                <div className={`inline-flex p-3 rounded-xl bg-zinc-900 border border-border/80 mb-4 ${feat.color}`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
              </div>
              
              <div className="mt-6 flex items-center text-xs font-bold text-indigo-400 group cursor-pointer">
                <span>Learn Details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-zinc-400 font-medium">
            Go from complex, undocumented source scripts to rich templates in four simple moves.
          </p>
        </div>

        {/* Timeline Animations */}
        <div className="relative border-l border-zinc-800 ml-4 md:ml-32 space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative pl-8 md:pl-12 text-left"
            >
              {/* Outer pulsing timeline ring */}
              <div className="absolute left-[-9px] top-1.5 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-background rounded-full" />
                </div>
              </div>

              {/* Number indicator */}
              <div className="hidden md:block absolute left-[-90px] top-0 text-3xl font-extrabold text-indigo-500/40 font-mono">
                {step.num}
              </div>

              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <span className="md:hidden text-indigo-400/80 mr-2 font-mono">{step.num}.</span>
                {step.title}
              </h3>
              <p className="text-zinc-400 font-medium text-sm leading-relaxed max-w-2xl">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Clear, Transparent Plans
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-zinc-400 font-medium">
            Start free, then unlock full cloning, PowerPoint generations, and dedicated team sandboxes.
          </p>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`rounded-3xl p-8 flex flex-col justify-between relative ${
                plan.highlight 
                  ? 'gradient-border-box shadow-[0_0_50px_rgba(99,102,241,0.08)] scale-105 z-10' 
                  : 'glass-panel border-border/80'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-6">{plan.desc}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm font-semibold ml-2">/ month</span>
                </div>

                <div className="border-t border-zinc-800/80 my-6" />

                <ul className="space-y-4 text-left">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start space-x-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  to={plan.href}
                  className={`block w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-zinc-900 border border-border hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Modal overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel border border-border/80 w-full max-w-4xl rounded-3xl p-6 relative overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 border border-border text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-left mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Terminal className="w-5 h-5 text-indigo-400 mr-2" />
                  RepoMind AI Product Tour
                </h3>
                <p className="text-xs text-zinc-400">See how our AST parser builds full blueprints in 25 seconds.</p>
              </div>

              {/* Fake Video Preview */}
              <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-border flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient-glow opacity-60" />
                
                {/* Simulated workspace screenshot preview mockup */}
                <div className="absolute inset-6 rounded-xl border border-zinc-800/80 bg-surface flex flex-col justify-between p-4 font-mono text-[10px] text-zinc-500 text-left select-none">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-zinc-400 font-bold">RepoMind OS v2.6.4</span>
                    <span className="text-emerald-400">● Live Connection</span>
                  </div>
                  <div className="space-y-1 my-3 overflow-hidden text-zinc-500">
                    <p className="text-zinc-300">$ npm run analyze --dir ./src</p>
                    <p className="text-zinc-400">✓ 142 files unpacked successfully.</p>
                    <p className="text-zinc-400">⚙ Scanning AST components network...</p>
                    <p className="text-indigo-400">ℹ Connected: Express server gate on port 5000</p>
                    <p className="text-violet-400">✓ 3D SVG Architecture map compiled.</p>
                    <p className="text-zinc-400">✓ Exporting artifacts/documentation.pdf</p>
                  </div>
                  <div className="flex items-center space-x-2 text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Analysis Complete. Ready to download files.</span>
                  </div>
                </div>

                <div className="relative z-10 w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/60 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Play className="w-6 h-6 fill-current text-indigo-400 translate-x-[2px]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
