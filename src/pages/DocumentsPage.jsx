import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import { FileCheck2, Search } from 'lucide-react';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const mockDocs = [
    {
      id: 'doc1',
      title: 'DOCX Technical Report',
      desc: 'Complete architectural specification of project components and handlers.',
      format: 'DOCX',
      statLabel: 'PAGES',
      statValue: '38 pages',
      iconType: 'docx',
      fileName: 'technical_report.docx',
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
      fileName: 'architecture.pdf',
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
      fileName: 'presentation.pptx',
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
      fileName: 'defense_guide.pdf',
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
      fileName: 'resume_bullets.docx',
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
      fileName: 'api_docs.zip',
      tabName: 'documentation'
    }
  ];

  const filtered = mockDocs.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div 
        className="flex-1 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 76 : 260 }}
      >
        <div className="max-w-5xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="border-b border-border/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Files Cockpit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Generated Documents
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
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Grid list of DocumentCards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No matching documents found.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
