import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

const ANALYSIS_STAGES = [
  { id: 'extract', label: 'Extracting Project Structure', duration: 1500 },
  { id: 'logic', label: 'Understanding Business Logic', duration: 2000 },
  { id: 'components', label: 'Mapping Components', duration: 1800 },
  { id: 'tech', label: 'Detecting Technologies', duration: 1200 },
  { id: 'graph', label: 'Building Architecture Graph', duration: 2200 },
  { id: 'docs', label: 'Generating Documentation', duration: 2500 },
  { id: 'ppt', label: 'Creating PowerPoint', duration: 1800 },
  { id: 'finalize', label: 'Finalizing Assets', duration: 1200 },
];

const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'ecommerce-microservices-main',
    type: 'zip',
    size: '14.2 MB',
    date: '2026-05-28 14:10',
    techStack: ['Node.js', 'React', 'MongoDB', 'Docker', 'GraphQL'],
    complexityScore: 89,
    rating: 'A+'
  },
  {
    id: 'p2',
    name: 'nextjs-saas-template',
    type: 'github',
    url: 'https://github.com/vercel/nextjs-saas-template',
    date: '2026-05-25 09:44',
    techStack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Prisma', 'PostgreSQL'],
    complexityScore: 82,
    rating: 'A'
  },
  {
    id: 'p3',
    name: 'ai-image-generator-python',
    type: 'zip',
    size: '8.7 MB',
    date: '2026-05-12 18:22',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'AWS S3', 'Redis'],
    complexityScore: 94,
    rating: 'S'
  }
];

const MOCK_GITHUB_REPOS = [
  { id: 1, name: 'payment-microservice', fullName: 'alex-mercer/payment-microservice', visibility: 'private', starsCount: 42, primaryLanguage: 'JavaScript', defaultBranch: 'main' },
  { id: 2, name: 'analytics-dashboard', fullName: 'alex-mercer/analytics-dashboard', visibility: 'public', starsCount: 128, primaryLanguage: 'TypeScript', defaultBranch: 'master' },
  { id: 3, name: 'saas-landing-page', fullName: 'alex-mercer/saas-landing-page', visibility: 'public', starsCount: 14, primaryLanguage: 'HTML', defaultBranch: 'main' },
  { id: 4, name: 'ml-recommendation-engine', fullName: 'saas-devkit/ml-recommendation-engine', visibility: 'private', starsCount: 95, primaryLanguage: 'Python', defaultBranch: 'main' },
  { id: 5, name: 'kubernetes-cluster-configs', fullName: 'saas-devkit/kubernetes-cluster-configs', visibility: 'private', starsCount: 3, primaryLanguage: 'Shell', defaultBranch: 'prod' }
];

export const ProjectProvider = ({ children }) => {
  const [history, setHistory] = useState(MOCK_PROJECTS);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Cinematic analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState([]);
  const [regeneratingAssets, setRegeneratingAssets] = useState({});

  // ------------------------------------------------------------------
  // NEW STATE: Commercial Billing & Quotas States
  // ------------------------------------------------------------------
  const [billingDetails, setBillingDetails] = useState({
    activePlan: 'free',
    creditBalance: 15,
    creditTransactions: [
      { id: 'tx_1', type: 'signup_bonus', amount: 15, description: 'SaaS Platform Signup Reward Credits', timestamp: '2026-05-28 14:10' }
    ],
    invoices: []
  });

  // ------------------------------------------------------------------
  // NEW STATE: GitHub Integrations States
  // ------------------------------------------------------------------
  const [githubDetails, setGithubDetails] = useState({
    isConnected: false,
    username: '',
    avatarUrl: '',
    repositories: [], // user's GitHub explorer repos
    syncedRepos: [],  // actively imported and monitored repos
    syncLogs: []      // push webhooks tracking logs
  });

  // Check if real backend is running at http://localhost:5000
  const [apiOnline, setApiOnline] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
        if (res) {
          setApiOnline(true);
          console.log('[API] Backend online detected.');
        }
      } catch (err) {
        setApiOnline(false);
      }
    };
    checkApi();
  }, []);

  // ------------------------------------------------------------------
  // NEW METHODS: Dynamic Coupon Calculations & Subscriptions
  // ------------------------------------------------------------------
  const applyCouponCode = async (planId, couponCode, planPrice) => {
    // 20% off for STUDENT20, 100% off for REFERRAL100, 10% off for custom refer keys
    let percentage = 0;
    if (couponCode.toUpperCase() === 'STUDENT20') percentage = 20;
    else if (couponCode.toUpperCase() === 'REFERRAL100') percentage = 100;
    else if (couponCode.length > 5) percentage = 10;

    const discountAmount = Number(((planPrice * percentage) / 100).toFixed(2));
    const finalPrice = Number((planPrice - discountAmount).toFixed(2));

    return {
      percentage,
      discountAmount,
      finalPrice
    };
  };

  const checkoutPlan = async (planId, billingInterval, couponCode, pricingDetails, gstDetails) => {
    const finalPrice = pricingDetails.finalPrice;
    
    // Auto-grant credits based on plans
    let grantCredits = 0;
    if (planId === 'pro') grantCredits = 100;
    if (planId === 'team') grantCredits = 500;
    if (planId === 'enterprise') grantCredits = 2500;

    // Simulate standard invoice compilation
    const invoiceNum = `INV-2026-000${billingDetails.invoices.length + 1}`;
    const baseGst = Number((finalPrice * 0.18).toFixed(2)); // 18% GST
    const totalWithGst = Number((finalPrice + baseGst).toFixed(2));

    const newInvoice = {
      invoiceNumber: invoiceNum,
      planId,
      amount: totalWithGst,
      date: new Date().toISOString().substring(0, 10),
      status: 'paid',
      companyName: gstDetails.companyName || 'Developer Inc.',
      gstIn: gstDetails.gstIn || 'N/A',
      gstAmount: baseGst,
      fileUrl: `http://localhost:5000/api/billing/invoice/${invoiceNum}`
    };

    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'plan_purchase',
      amount: grantCredits,
      description: `Upgraded to ${planId.toUpperCase()} subscription tier plan`,
      timestamp: new Date().toISOString().substring(0, 10) + ' ' + new Date().toTimeString().substring(0, 5)
    };

    // Update active state
    setBillingDetails(prev => ({
      ...prev,
      activePlan: planId,
      creditBalance: prev.creditBalance + grantCredits,
      creditTransactions: [newTx, ...prev.creditTransactions],
      invoices: [newInvoice, ...prev.invoices]
    }));

    return {
      success: true,
      invoiceNumber: invoiceNum,
      grantedCredits: grantCredits
    };
  };

  const consumeSlideCredits = (amount = 5, description = 'Deducted Slide presentation credits') => {
    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'credit_deduction',
      amount: -amount,
      description,
      timestamp: new Date().toISOString().substring(0, 10) + ' ' + new Date().toTimeString().substring(0, 5)
    };
    setBillingDetails(prev => ({
      ...prev,
      creditBalance: Math.max(0, prev.creditBalance - amount),
      creditTransactions: [newTx, ...prev.creditTransactions]
    }));
  };

  // ------------------------------------------------------------------
  // NEW METHODS: GitHub Link & Repositories discovery
  // ------------------------------------------------------------------
  const connectGitHub = () => {
    // Triggers beautiful connected state
    setGithubDetails(prev => ({
      ...prev,
      isConnected: true,
      username: 'alex-mercer',
      avatarUrl: 'https://github.com/identicons/octocat.png',
      repositories: MOCK_GITHUB_REPOS
    }));
  };

  const disconnectGitHub = () => {
    setGithubDetails(prev => ({
      ...prev,
      isConnected: false,
      username: '',
      avatarUrl: '',
      repositories: [],
      syncedRepos: []
    }));
  };

  const syncGitHubRepository = async (repoName, branch = 'main') => {
    const targetRepo = githubDetails.repositories.find(r => r.name === repoName) || {
      name: repoName,
      fullName: `alex-mercer/${repoName}`,
      visibility: 'private',
      primaryLanguage: 'JavaScript',
      starsCount: 0
    };

    // Check if already synced
    const exists = githubDetails.syncedRepos.some(r => r.name === repoName);
    if (!exists) {
      setGithubDetails(prev => ({
        ...prev,
        syncedRepos: [...prev.syncedRepos, { ...targetRepo, defaultBranch: branch, lastSynced: 'Just now', isMonitoring: true }]
      }));
    }

    // Spawns webhook pushes logs
    const newPushLog = {
      id: `log_${Date.now()}`,
      repoName,
      commitHash: `rev_${Math.random().toString(36).substr(2, 6)}`,
      author: 'alex-mercer',
      message: 'Automatic synchronizations updates: Ast engine compilations',
      status: 'success',
      timestamp: 'Just now'
    };

    setGithubDetails(prev => ({
      ...prev,
      syncLogs: [newPushLog, ...prev.syncLogs]
    }));

    // Trigger standard cinematic scanner
    startCinematicAnalysis(repoName, 'github', `https://github.com/alex-mercer/${repoName}`);
  };

  // Active stage helper log messages
  const stageLogs = {
    extract: [
      'Initializing file streaming buffer...',
      'Unpacking zip headers...',
      'Found 142 discrete files, 14 sub-directories.',
      'Constructing local indexing map...',
      'File structure cached successfully.'
    ],
    logic: [
      'Scanning AST tree for exports...',
      'Parsing index modules and handlers...',
      'Mapping state pipelines and user endpoints...',
      'Resolving 42 structural controller chains.',
      'Identified critical entry-point: src/server.js'
    ],
    components: [
      'Deconstructing interface assets...',
      'Tracking child-to-parent component routes...',
      'Parsing JSX tree connections...',
      'Found 24 modular UI dependencies.',
      'Resolved state hooks & render channels.'
    ],
    tech: [
      'Analyzing package.json dependencies...',
      'Detected Express (v4.18.2) & React (v18.2.0)',
      'Identified GraphQL queries & Prisma ORM targets...',
      'Matching system frameworks...',
      'Libraries mapped: React, TailwindCSS, Express, MongoDB.'
    ],
    graph: [
      'Spawning SVG canvas node coordinates...',
      'Tracing database schemas to server gateways...',
      'Calculating visual clusters (Force-Directed Graph)...',
      'Resolving 4 redundant connections.',
      'Rendered 3D node map representation.'
    ],
    docs: [
      'Generating Markdown technical blueprints...',
      'Structuring README assets...',
      'Drafting class structures and controller maps...',
      'AI summarizing component interactions...',
      'Created 12 detailed documentation chapters.'
    ],
    ppt: [
      'Structuring PowerPoint outline templates...',
      'Populating structural hierarchy slides...',
      'Applying modern dark gradient slides & icons...',
      'Compiling visual architecture schematics...',
      'PPT Presentation decks rendered.'
    ],
    finalize: [
      'Validating artifact checksum files...',
      'Compressing DOCX & PDF templates...',
      'Assembling viva checklist answers (35 Q&As)...',
      'Saving results to cloud server node...',
      'Analysis completed successfully! Directing to cockpit...'
    ]
  };

  const startCinematicAnalysis = (projectName, type, extraInfo) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStageIndex(0);
    setAnalysisLogs(['[SYSTEM] Initializing RepoMind AI Scanner...']);
    
    const newProj = {
      id: 'p_' + Date.now(),
      name: projectName,
      type: type,
      url: type === 'github' ? extraInfo : undefined,
      size: type === 'zip' ? extraInfo : undefined,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      techStack: type === 'github' ? ['Next.js', 'TypeScript', 'TailwindCSS', 'Prisma'] : ['Node.js', 'React', 'MongoDB', 'Express'],
      complexityScore: Math.floor(Math.random() * 20) + 78,
      rating: 'A+'
    };

    setCurrentProject(newProj);
  };

  // Simulated tick for step-by-step progress
  useEffect(() => {
    if (!isAnalyzing) return;

    let logTick;
    let logIndex = 0;
    const stage = ANALYSIS_STAGES[currentStageIndex];
    const logsForStage = stageLogs[stage.id] || [];

    // Trigger sequential logs
    logTick = setInterval(() => {
      if (logIndex < logsForStage.length) {
        setAnalysisLogs(prev => [...prev, `[${stage.label.toUpperCase()}] ${logsForStage[logIndex]}`]);
        logIndex++;
      }
    }, stage.duration / (logsForStage.length + 1));

    const stageTimeout = setTimeout(() => {
      clearInterval(logTick);
      if (currentStageIndex < ANALYSIS_STAGES.length - 1) {
        // Next Stage
        setCurrentStageIndex(prev => prev + 1);
        setAnalysisProgress(Math.floor(((currentStageIndex + 1) / ANALYSIS_STAGES.length) * 100));
      } else {
        // Complete!
        setAnalysisProgress(100);
        setTimeout(() => {
          setIsAnalyzing(false);
          setHistory(prev => [currentProject, ...prev]);
        }, 1000);
      }
    }, stage.duration);

    return () => {
      clearInterval(logTick);
      clearTimeout(stageTimeout);
    };
  }, [isAnalyzing, currentStageIndex, currentProject]);

  const uploadZipFile = (file) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    startCinematicAnalysis(file.name.replace('.zip', ''), 'zip', sizeMB);
  };

  const connectGitHubRepo = (url) => {
    const name = url.split('/').pop().replace('.git', '') || 'github-repo';
    startCinematicAnalysis(name, 'github', url);
  };

  const selectProjectFromHistory = (proj) => {
    setCurrentProject(proj);
  };

  const triggerRegenerate = (assetId) => {
    setRegeneratingAssets(prev => ({ ...prev, [assetId]: true }));
    setTimeout(() => {
      setRegeneratingAssets(prev => ({ ...prev, [assetId]: false }));
    }, 2000);
  };

  return (
    <ProjectContext.Provider value={{
      history,
      currentProject,
      setCurrentProject,
      isAnalyzing,
      analysisProgress,
      currentStageIndex,
      analysisStages: ANALYSIS_STAGES,
      analysisLogs,
      uploadZipFile,
      connectGitHubRepo,
      selectProjectFromHistory,
      regeneratingAssets,
      triggerRegenerate,
      
      // Billing SaaS APIs
      billingDetails,
      applyCouponCode,
      checkoutPlan,
      consumeSlideCredits,

      // GitHub OAuth APIs
      githubDetails,
      connectGitHub,
      disconnectGitHub,
      syncGitHubRepository
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
