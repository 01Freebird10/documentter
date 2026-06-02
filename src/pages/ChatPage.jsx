import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ArchitectureViewer from '../components/ArchitectureViewer';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  Coins, 
  Network, 
  BookOpen, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Terminal, 
  Code2, 
  Compass, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../hooks/useProject';

export default function ChatPage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // States from Project Context hook
  const { history: userProjects, currentProject, selectProjectFromHistory } = useProject();

  const [activeProject, setActiveProject] = useState(currentProject || userProjects[0] || null);
  const [conversationId, setConversationId] = useState('conv_' + Date.now());
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState('architect'); // architect, security, performance, interview
  const [activeRightTab, setActiveRightTab] = useState('citations'); // citations, graph, modes
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);

  const messagesEndRef = useRef(null);

  // Suggested questions mapped per active mode
  const suggestedQuestionsMap = {
    architect: [
      'Explain System Design and components.',
      'Where is user registration implemented?',
      'Explain the JWT authentication request lifecycle.'
    ],
    security: [
      'What security issues exist in this codebase?',
      'Review middleware rate limiting.',
      'Are there any unvalidated query vulnerabilities?'
    ],
    performance: [
      'Find performance improvements and bottlenecks.',
      'Recommend database indexing optimizations.',
      'Suggest Redis caching candidates.'
    ],
    interview: [
      'Generate viva defense questions for my exam.',
      'Why MongoDB over PostgreSQL?',
      'Explain the REST API routing logic.'
    ]
  };

  // Sync active project if changed globally
  useEffect(() => {
    if (currentProject) {
      setActiveProject(currentProject);
      setMessages([]);
      setConversationId('conv_' + Date.now());
      setSelectedCitation(null);
    }
  }, [currentProject]);

  // Scroll chats to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mock chat compiler responses (failsafe local API simulator)
  const simulateAIChatReply = (userMsg) => {
    setIsTyping(true);
    
    // Simulate typical network and token retrieval latency
    setTimeout(() => {
      let content = '';
      let citationsList = [];
      const queryLower = userMsg.toLowerCase();

      // RAG Local Context Compiler mappings
      if (activeMode === 'security') {
        content = `### 🛡️ Security Audit & Vulnerability Review
Based on an audit of **${activeProject?.name}**, here are identified security targets:

| Vulnerability Vector | Severity | Remediation Strategy |
| :--- | :--- | :--- |
| **Monolithic Router Controller** | Low | Decouple the monolithic controller chains inside \`authController.js\` into dynamic validation services. |
| **Unbounded Query Parameters** | Medium | Implement validation schema maps using Joi or express-validator to secure database operations against parameter injection risks. |
| **野 Caching Setup** | Low | Guard dynamic endpoints by locking Wildcard CORS parameters inside \`server.js\`. |

#### Recommended Action Snippet:
Validate tokens explicitly before processing dynamic workspace deletions:
\`\`\`javascript
// src/middleware/authMiddleware.js
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('Unauthorized token missing.', 401));
  // verify signatures...
};
\`\`\``;
        citationsList = [
          { file: 'src/middleware/errorMiddleware.js', lines: '10-38', snippet: `export default (err, req, res, next) => {\n  const statusCode = err.statusCode || 500;\n  res.status(statusCode).json({ success: false, message: err.message });\n};` },
          { file: 'src/server.js', lines: '42-70', snippet: `app.use(helmet());\napp.use(cors({ origin: '*' }));\napp.use(express.json());` }
        ];
      } else if (activeMode === 'performance') {
        content = `### ⚡ Codebase Optimization & Caching Review
Here are 3 concrete strategies to improve query performance for **${activeProject?.name}**:

1. **Implement Database Schema Indices**:
   - Ensure the Mongoose collections include index parameters on foreign keys like \`projectId\` to avoid full collection scans:
     \`\`\`javascript
     projectId: { type: mongoose.Schema.Types.ObjectId, index: true }
     \`\`\`
2. **Dynamic In-Memory Caches**:
   - Cache static lists (such as tech diagnostics definitions) in a local cache library or Redis database node.
3. **Async File Streams**:
   - Refactor file reading pipelines to utilize asynchronous streams (\`fs.promises.readFile\`) to eliminate blocking the Node.js event loop.`;
        citationsList = [
          { file: 'src/models/Project.js', lines: '1-30', snippet: `const projectSchema = new mongoose.Schema({\n  userId: { type: ObjectId, ref: 'User', index: true },\n  projectName: { type: String, required: true }\n});` },
          { file: 'src/services/parserService.js', lines: '65-78', snippet: `export const readFileText = (filePath) => {\n  return fs.readFileSync(filePath, 'utf-8');\n};` }
        ];
      } else if (activeMode === 'interview') {
        content = `### 🎓 Academic Defense prep Q&As
Here are highly targeted viva review prompts for **${activeProject?.name}**:

#### Q1: Why did you choose Express.js as the core API framework?
- **Answer**: Express provides a minimalist, robust middleware architecture. This facilitates clean routing separation, rapid request validation, and lightweight integration of JWT authenticators.

#### Q2: How does the AST technology detection engine manage confidence scores?
- **Answer**: It crawling manifest files like \`package.json\`, scans import lists in code scripts, and assigns percentages weights based on import recurrences, ensuring accurate categorization.

#### Q3: Where are PDF and PowerPoint reports compiled?
- **Answer**: The backend implements dedicated services (\`pdfService.js\`, \`pptxService.js\`) called asynchronously via background queue workers. The compiled assets are saved under \`/uploads\` and served via an express downloader gateway.`;
        citationsList = [
          { file: 'src/services/analysisService.js', lines: '50-88', snippet: `const masterContext = await analyzeWorkspace(workspacePath, projectName);\nconst aiContext = await generateAIBlueprints(project._id, masterContext);` },
          { file: 'src/services/technologyService.js', lines: '1-35', snippet: `export const detectTechnologies = (files) => {\n  // Scan packages list and imports chains...\n};` }
        ];
      } else {
        // Architect Mode
        if (queryLower.includes('auth') || queryLower.includes('jwt') || queryLower.includes('protect')) {
          content = `### 🔑 Authentication Flow & JWT Walkthrough
Based on the retrieved code chunks, here is the full **Authentication request lifecycle**:

1. **Credentials verification**:
   - The client posts details to \`POST /api/auth/login\`. The request reaches \`authController.js\`.
2. **Token Generation**:
   - If password hashes match (bcrypt verified), the server signs a JWT payload using \`process.env.JWT_SECRET\` and returns it to the user.
3. **Bearer Security Gate**:
   - Subsequent REST requests include the token in the \`Authorization: Bearer <token>\` header. The middleware intercepts and decodes the token before granting access.

#### CITATION FILES:
- \`src/middleware/authMiddleware.js\` (JWT rate limits & verification)
- \`src/controllers/authController.js\` (Registration & hashing)`;
          citationsList = [
            { file: 'src/middleware/authMiddleware.js', lines: '10-45', snippet: `export const protect = async (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader?.startsWith('Bearer ')) throw new AppError('Unauthorized', 401);\n  // decode token...\n};` },
            { file: 'src/controllers/authController.js', lines: '24-58', snippet: `export const login = async (req, res, next) => {\n  const { email, password } = req.body;\n  const user = await User.findOne({ email });\n  // sign tokens...\n};` }
          ];
        } else if (queryLower.includes('db') || queryLower.includes('database') || queryLower.includes('schema') || queryLower.includes('model')) {
          content = `### 🗄️ Database Design & Models Relationships
Based on the repository schemas definition, **${activeProject?.name}** implements a structured relational data model:

1. **User Model**:
   - Stores user credentials, active plan status, and credit allowances.
2. **Project Model**:
   - Linked to User ID (\`ref: 'User'\`). Stores upload path links, tech stack array tags, and parsed AST contexts.
3. **GeneratedDocument Model**:
   - Map-referenced to the parent Project ID, cataloging compiled Word documents, presentation slides, and PDFs.

#### Schema Citation Files:
- \`src/models/User.js\` (User collections)
- \`src/models/Project.js\` (Linked workspaces)`;
          citationsList = [
            { file: 'src/models/Project.js', lines: '1-35', snippet: `const projectSchema = new mongoose.Schema({\n  userId: { type: ObjectId, ref: 'User', required: true },\n  projectName: { type: String, required: true },\n  techStack: [String],\n  analysisContext: Object\n});` },
            { file: 'src/models/User.js', lines: '10-38', snippet: `const userSchema = new mongoose.Schema({\n  name: { type: String, required: true },\n  email: { type: String, required: true, unique: true },\n  credits: { type: Number, default: 15 }\n});` }
          ];
        } else {
          content = `### 🏛️ System Architecture Walkthrough
As a Senior Software Architect, here is an overview of **${activeProject?.name}**'s core layers:

1. **API Router Interface**:
   - Express server routers process entry-point URLs, sanitize query values, and dispatch jobs.
2. **Asynchronous Background Processing (Workers)**:
   - Intensive compilation pipelines (Puppeteer diagrams, PDF compilers, Word builders) are completely managed in background workers queues (powered by **BullMQ & Redis**).
3. **Database Layer (Mongoose Schemas)**:
   - Stores schema templates for Users, Payments, Invoices, GitHub profiles, and workspace snapshots.

#### Relevant Source Citations:
- \`src/server.js\` (App entries)
- \`src/services/analysisService.js\` (Background worker triggers)`;
          citationsList = [
            { file: 'src/server.js', lines: '80-100', snippet: `app.use('/api/auth', authRoutes);\napp.use('/api/projects', projectRoutes);\napp.use('/api/chat', chatRoutes);` },
            { file: 'src/services/analysisService.js', lines: '17-48', snippet: `export const runBackgroundAnalysis = async (projectId, workspacePath, projectName) => {\n  // step-by-step pipeline...\n};` }
          ];
        }
      }

      const newAssistantMsg = {
        id: 'msg_as_' + Date.now(),
        role: 'assistant',
        content,
        citations: citationsList,
        suggestedQuestions: suggestedQuestionsMap[activeMode].slice(0, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newAssistantMsg]);
      setIsTyping(false);
      
      // Auto-open first citation in list
      if (citationsList.length > 0) {
        setSelectedCitation(citationsList[0]);
      }
    }, 1500);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const newUserMsg = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setQuery('');
    simulateAIChatReply(query);
  };

  const handleSuggestedClick = (text) => {
    const newUserMsg = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    simulateAIChatReply(text);
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId('conv_' + Date.now());
    setSelectedCitation(null);
  };

  const handleProjectSelect = (proj) => {
    setActiveProject(proj);
    selectProjectFromHistory(proj);
    setMessages([]);
    setConversationId('conv_' + Date.now());
    setSelectedCitation(null);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* collapsible Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Grid Workspace Layout */}
      <div 
        className="flex-1 min-h-screen pt-20 px-4 sm:px-6 pb-6 flex flex-col md:grid md:grid-cols-12 md:gap-6 transition-all duration-300 overflow-hidden"
        style={{ marginLeft: isCollapsed ? 76 : 260 }}
      >
        {/* ==================================================================
            LEFT SUB-SIDEBAR PANEL: Conversation Threads & Repos Switcher (Cols: 3)
            ================================================================== */}
        <div className="md:col-span-3 flex flex-col space-y-4 max-h-[calc(100vh-100px)]">
          {/* Repository Selector */}
          <div className="bg-zinc-900/60 border border-border p-4 rounded-3xl space-y-3 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Active Repository</label>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const selected = userProjects.find(p => p.id === e.target.value);
                if (selected) handleProjectSelect(selected);
              }}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
            >
              {userProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Conversations actions & list */}
          <div className="flex-1 bg-[#111113]/40 border border-border/80 rounded-3xl p-4 flex flex-col justify-between text-left relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Conversations</span>
                <button
                  onClick={handleNewChat}
                  className="p-1 rounded bg-zinc-900 border border-border hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="New Conversation"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Session link */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <button
                  className="w-full text-left p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center space-x-3 text-xs font-semibold relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-white truncate">Architect Session</p>
                    <p className="text-[9px] text-zinc-500 font-medium font-mono mt-0.5">{conversationId.substring(0, 12)}...</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="border-t border-border/30 pt-3 mt-4 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              <span>Status: Active</span>
              <span className="flex items-center text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                RAG Engaged
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            CENTER PANEL: Modern Chat interface (Cols: 5)
            ================================================================== */}
        <div className="md:col-span-5 flex flex-col bg-zinc-950/40 border border-border/80 rounded-3xl p-6 max-h-[calc(100vh-100px)] min-h-[480px]">
          {/* Header info */}
          <div className="border-b border-border/30 pb-3 mb-4 flex justify-between items-center text-left">
            <div>
              <div className="flex items-center space-x-2 text-[8px] font-bold uppercase tracking-widest text-indigo-400">
                <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>AI Architect Assistant</span>
              </div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mt-1">{activeProject?.name}</h3>
            </div>

            <button
              onClick={handleNewChat}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          {/* Conversation Bubbles Scroll Portal */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 text-left custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4"
                >
                  <Bot className="w-10 h-10 text-indigo-500 animate-bounce" />
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Audit & Chat with Codebase</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Ask detailed technical questions, perform automated security reviews, or optimize database queries. The repository is the source of truth.
                    </p>
                  </div>

                  {/* Empty state suggestions */}
                  <div className="w-full space-y-2 pt-4">
                    {suggestedQuestionsMap[activeMode].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedClick(q)}
                        className="w-full text-left p-3 bg-zinc-900/60 border border-border/60 hover:border-indigo-500/40 hover:bg-zinc-900 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all active:scale-[0.99] flex justify-between items-center"
                      >
                        <span>{q}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 relative overflow-hidden ${
                        msg.role === 'user'
                          ? 'bg-zinc-900 border border-border text-white'
                          : 'bg-[#111113] border border-border/80 text-zinc-300 shadow-xl'
                      }`}
                    >
                      {/* Message role header */}
                      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        <span>{msg.role === 'user' ? 'Developer' : 'AI Architect'}</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Markdown Text Body */}
                      <div className="markdown-content font-medium whitespace-pre-line">
                        {msg.content}
                      </div>

                      {/* Suggested query buttons from AI responses */}
                      {msg.role === 'assistant' && msg.suggestedQuestions?.length > 0 && (
                        <div className="pt-3 border-t border-zinc-900 space-y-1.5">
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Suggested Queries</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedQuestions.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestedClick(q)}
                                className="px-2.5 py-1 rounded bg-zinc-900 border border-border/80 hover:border-indigo-500/40 text-[9px] font-bold text-zinc-400 hover:text-white uppercase transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing indicators loader */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-4 bg-zinc-900/60 border border-border/60 rounded-2xl flex items-center space-x-2 text-zinc-500 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="font-semibold uppercase tracking-wider text-[9px] ml-1">Retreiving files chunks...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Form input controls */}
          <form onSubmit={handleSendMessage} className="relative mt-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask about authentication, schemas, routes, or files...`}
              disabled={isTyping || !activeProject}
              className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !query.trim()}
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ==================================================================
            RIGHT PANEL: Context Explorer, UML Graph, Mode Select (Cols: 4)
            ================================================================== */}
        <div className="md:col-span-4 flex flex-col space-y-4 max-h-[calc(100vh-100px)]">
          {/* Tabs Selector headers */}
          <div className="flex bg-zinc-900 border border-border p-1 rounded-2xl text-[9px] font-bold uppercase tracking-widest">
            {[
              { id: 'citations', label: 'Citations', icon: BookOpen },
              { id: 'graph', label: 'Knowledge Graph', icon: Network },
              { id: 'modes', label: 'AI Modes', icon: Cpu }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
                  activeRightTab === tab.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right tab contents portal */}
          <div className="flex-1 bg-zinc-950/40 border border-border/80 rounded-3xl p-6 min-h-[300px] overflow-y-auto text-left flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {/* 1. CITATIONS TAB */}
              {activeRightTab === 'citations' && (
                <motion.div
                  key="citations"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col h-full justify-between"
                >
                  <div className="space-y-3.5 flex-1">
                    <div className="border-b border-border/30 pb-2 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Citations Reference source</h4>
                        <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Retrieved relevant files matched by RAG vectors</p>
                      </div>
                    </div>

                    {/* Citations file paths list */}
                    {messages.length > 0 && messages[messages.length - 1]?.citations?.length > 0 ? (
                      <div className="space-y-2">
                        {messages[messages.length - 1].citations.map((cit, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedCitation(cit)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold uppercase flex items-center justify-between ${
                              selectedCitation?.file === cit.file
                                ? 'bg-indigo-500/5 border-indigo-500/30 text-white'
                                : 'bg-zinc-900 border-border/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            <span className="truncate max-w-[80%] font-mono tracking-wider text-[10px]">{cit.file}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">Lines {cit.lines}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-zinc-500 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl">
                        <BookOpen className="w-5 h-5 text-zinc-650 mb-2 animate-pulse" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider">No citations found</p>
                        <p className="text-[9px] text-zinc-600 mt-1 max-w-[200px] leading-normal font-medium mx-auto">Citations appear automatically when the AI retrieves source files.</p>
                      </div>
                    )}

                    {/* Matched code preview blocks */}
                    {selectedCitation && (
                      <div className="space-y-2 pt-2 animate-fade-in">
                        <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                          <Terminal className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                          Code Snapshot Preview
                        </h5>
                        <div className="p-3 bg-zinc-950 border border-border/80 rounded-xl font-mono text-[9px] text-zinc-400 overflow-x-auto max-h-[160px] whitespace-pre-wrap leading-relaxed select-all">
                          {selectedCitation.snippet}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. KNOWLEDGE GRAPH TAB */}
              {activeRightTab === 'graph' && (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col h-full"
                >
                  <div className="border-b border-border/30 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Relational Code Graph</h4>
                    <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Inspect module junctions and REST route controllers</p>
                  </div>

                  {/* Embed visual SVG Graph component */}
                  <div className="flex-1 min-h-[320px] relative">
                    <ArchitectureViewer />
                  </div>
                </motion.div>
              )}

              {/* 3. ASSISTANT MODES TAB */}
              {activeRightTab === 'modes' && (
                <motion.div
                  key="modes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col h-full"
                >
                  <div className="border-b border-border/30 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assistant Query Modes</h4>
                    <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Toggle active prompt personalities and suggestions</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'architect', label: 'Architect Design Mode', desc: 'Traces request lifecycles, dependencies flowcharts, and MVC layouts.', icon: Compass, color: 'text-indigo-400 border-indigo-500/20' },
                      { id: 'security', label: 'Security Review Mode', desc: 'Audits code chunks for input sanitization, JWT ratings, and CORS leaks.', icon: ShieldAlert, color: 'text-amber-400 border-amber-500/20' },
                      { id: 'performance', label: 'Performance Audit Mode', desc: 'Proposes DB schema indexing, Redis caching slots, and query speeds.', icon: Zap, color: 'text-emerald-400 border-emerald-500/20' },
                      { id: 'interview', label: 'Viva Interview Mode', desc: 'Grills the user with academic defense prep questions and model metrics.', icon: BookOpen, color: 'text-blue-400 border-blue-500/20' }
                    ].map(mode => {
                      const isActive = activeMode === mode.id;
                      const Icon = mode.icon;

                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setActiveMode(mode.id);
                            alert(`Assistant mode swapped to: ${mode.label}`);
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                            isActive
                              ? 'bg-zinc-900 border-zinc-700 shadow-lg text-white'
                              : 'bg-zinc-950/40 border-border/60 text-zinc-400 hover:text-white hover:border-zinc-800'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-zinc-950 border ${mode.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-bold uppercase tracking-wider leading-none mb-1">{mode.label}</h5>
                            <p className="text-[9px] text-zinc-500 font-semibold leading-normal">{mode.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
