import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import ArchitectureViewer from '../components/ArchitectureViewer';
import DocumentCard from '../components/DocumentCard';
import { 
  FolderKanban, 
  Sparkles, 
  ShieldAlert, 
  Gauge, 
  TrendingUp, 
  Layers, 
  ArrowLeft,
  ChevronRight,
  Code2,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { currentProject } = useProject();

  useEffect(() => {
    if (!currentProject) {
      navigate('/upload');
    }
  }, [currentProject, navigate]);

  if (!currentProject) return null;

  const generatedDocs = [
    {
      id: 'doc1',
      title: 'DOCX Technical Report',
      desc: 'Complete architectural specification of project components and handlers.',
      format: 'DOCX',
      statLabel: 'PAGES',
      statValue: '38 pages',
      iconType: 'docx',
      fileName: `${currentProject.name}_technical_report.docx`,
      tabName: 'report'
    },
    {
      id: 'doc2',
      title: 'PDF Architecture Spec',
      desc: 'Clean, printable summary manual tracing stack data models and routing maps.',
      format: 'PDF',
      statLabel: 'SIZE',
      statValue: '2.8 MB',
      iconType: 'pdf',
      fileName: `${currentProject.name}_architecture.pdf`,
      tabName: 'documentation'
    },
    {
      id: 'doc3',
      title: 'PPT Presentation Deck',
      desc: 'Sleek visual slides illustrating stack configurations and database layers.',
      format: 'PPTX',
      statLabel: 'SLIDES',
      statValue: '15 slides',
      iconType: 'pptx',
      fileName: `${currentProject.name}_presentation.pptx`,
      tabName: 'presentation'
    },
    {
      id: 'doc4',
      title: 'Viva Defense Prep Sheet',
      desc: 'Compilation of 35 review questions mapping code decisions.',
      format: 'PDF',
      statLabel: 'Q&AS',
      statValue: '35 prompts',
      iconType: 'viva',
      fileName: `${currentProject.name}_defense_guide.pdf`,
      tabName: 'report'
    },
    {
      id: 'doc5',
      title: 'Resume Highlights Bullet',
      desc: 'Converts structural code files into optimized impacts for resume updates.',
      format: 'DOCX',
      statLabel: 'BULLETS',
      statValue: '8 summaries',
      iconType: 'resume',
      fileName: `${currentProject.name}_resume_bullets.docx`,
      tabName: 'documentation'
    },
    {
      id: 'doc6',
      title: 'Technical Documentation',
      desc: 'Detailed parameters of API routes, models, schemas, and directories.',
      format: 'HTML',
      statLabel: 'ENDPOINTS',
      statValue: '14 routes',
      iconType: 'tech',
      fileName: `${currentProject.name}_api_docs.zip`,
      tabName: 'documentation'
    }
  ];

  // Mock Diagnostic parameters
  const features = [
    'Secure JSON Web Token (JWT) user credential validation gateways.',
    'Automated PostgreSQL / Prisma database schema migrations.',
    'Dockerized multi-stage container assets setup files.',
    'Integrated Express REST Controller pipelines routing structures.'
  ];

  const strengths = [
    'Modular directory routing clusters conforming to scalable Clean Architecture paradigms.',
    'High unit test coverage mapping core authentication controller states.',
    'Well-configured lint settings minimizing code redundancy parameters.'
  ];

  const improvements = [
    'Resolve 4 unvalidated nested SQL parameter chains to secure against injections.',
    'Implement Redis cache layers for highly recurrent queries requests.',
    'Refactor controller files exceeding 400 lines into secondary handlers modules.'
  ];

  return (
    <div className="relative min-h-screen bg-background text-zinc-100 pt-20 px-4 sm:px-6 lg:px-8 pb-12 overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[200px] right-0 w-[500px] h-[500px] rounded-full aura-glow-1 opacity-20 pointer-events-none" />
      <div className="absolute top-[800px] left-0 w-[400px] h-[400px] rounded-full aura-glow-2 opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.12]" />

      <div className="max-w-6xl mx-auto z-10 relative space-y-10">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-left">
          <button 
            onClick={() => navigate('/upload')} 
            className="flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Workspace</span>
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Analysis Results</span>
        </div>

        {/* Header Metadata Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6 text-left">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Compilation Completed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-sans truncate max-w-lg">
              {currentProject.name}
            </h1>
            
            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {currentProject.techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-border/80 text-xs text-zinc-300 font-semibold tracking-wide">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity Score Ring */}
          <div className="flex items-center space-x-4 bg-zinc-900/50 border border-border/80 px-6 py-4 rounded-3xl shrink-0">
            <div className="relative flex items-center justify-center">
              {/* Radial Score Circle */}
              <svg className="w-16 h-16">
                <circle cx="32" cy="32" r="26" stroke="#27272A" strokeWidth="3" fill="none" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  stroke="url(#accentGlow)" 
                  strokeWidth="3.5" 
                  fill="none" 
                  strokeDasharray="163" 
                  strokeDashoffset={163 - (163 * currentProject.complexityScore) / 100}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-white">{currentProject.complexityScore}</span>
            </div>

            <div className="text-left">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity Score</p>
              <p className="text-lg font-extrabold text-indigo-400 font-sans mt-0.5">Rating: {currentProject.rating}</p>
            </div>
          </div>
        </div>

        {/* 1. Diagnostic summaries Split: Features, Strengths, Areas of Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Detected Features */}
          <div className="glass-panel border border-border/85 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center space-x-2 border-b border-border/30 pb-3 mb-4">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Detected Features</h4>
            </div>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="text-xs text-zinc-400 leading-relaxed font-medium flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostic Strengths */}
          <div className="glass-panel border border-border/85 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center space-x-2 border-b border-border/30 pb-3 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Architectural Strengths</h4>
            </div>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-zinc-400 leading-relaxed font-medium flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostic Improvements */}
          <div className="glass-panel border border-border/85 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center space-x-2 border-b border-border/30 pb-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Refactoring Targets</h4>
            </div>
            <ul className="space-y-3">
              {improvements.map((imp, i) => (
                <li key={i} className="text-xs text-zinc-400 leading-relaxed font-medium flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Interactive SVG Architecture Graph */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-indigo-400" />
              Interactive Architecture Spec
            </h3>
            <span className="text-[10px] text-zinc-500 font-semibold font-mono">AST mapped successfully</span>
          </div>
          <ArchitectureViewer />
        </div>

        {/* 3. Generated Assets download grid */}
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Generated Artifact Packages</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
