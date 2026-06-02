import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  User, 
  Key, 
  CreditCard, 
  Bell, 
  Sliders, 
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Plus,
  GitBranch,
  Search,
  Check,
  Download,
  AlertTriangle,
  Receipt,
  Coins
} from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../hooks/useProject';

export default function SettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Hooks state variables
  const { 
    billingDetails, 
    applyCouponCode, 
    checkoutPlan, 
    githubDetails, 
    connectGitHub, 
    disconnectGitHub, 
    syncGitHubRepository 
  } = useProject();

  const settingsTabs = [
    { id: 'profile', name: 'Profile Details', icon: User },
    { id: 'api-keys', name: 'API Key Manager', icon: Key },
    { id: 'github', name: 'GitHub Integration', icon: GithubIcon },
    { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const [profile, setProfile] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@saasdevkit.com',
    company: 'SaaS DevKit LLC',
    role: 'Lead Architect'
  });

  const [keys, setKeys] = useState([
    { id: 'k1', name: 'Dev Gateway Key', val: 'sk_repomind_1928a8bc81920acbb', created: '2026-05-10', status: 'active' },
    { id: 'k2', name: 'Production Pipeline Key', val: 'sk_repomind_8828c29db221087cf', created: '2026-05-18', status: 'active' }
  ]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert('Profile configurations updated successfully!');
  };

  const handleAddKey = () => {
    const newKey = {
      id: 'k_' + Date.now(),
      name: 'Staging System Key',
      val: 'sk_repomind_' + Math.random().toString(36).substring(2, 18),
      created: new Date().toISOString().substring(0, 10),
      status: 'active'
    };
    setKeys([...keys, newKey]);
  };

  const handleDeleteKey = (id) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  // ------------------------------------------------------------------
  // NEW: Pricing Tiers & Interactive Checkout Overlay
  // ------------------------------------------------------------------
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      description: 'Explore the AST compilation engine with basic metrics.',
      features: [
        '3 Projects Per Month',
        '3 Documentation Reports',
        'Basic PDF Compile',
        'Basic PPT Outline',
        'Limited Diagrams Generation'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 29,
      description: 'Complete codebase visualization and unlimited outputs.',
      features: [
        'Unlimited Project Analysis',
        'Unlimited PDF & PPT Reports',
        'Premium Layout Designs',
        'Advanced 3D Architecture Diagrams',
        'Repository Chat AI Interface',
        'Priority Engine Processing Queue'
      ]
    },
    {
      id: 'team',
      name: 'Team Plan',
      price: 99,
      description: 'Collaborative pipeline scanning for organization repos.',
      features: [
        'Everything in Pro Plan',
        'Collaborative Organization workspaces',
        'Schedules Daily automated sweeps',
        'CI/CD Deployment Actions tracking',
        'Custom Webhooks processing modules',
        'API Keys continuous integration support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 299,
      description: 'Dedicated infrastructure with bespoke support models.',
      features: [
        'Everything in Team Plan',
        'Multi-region high-availability server nodes',
        'SAML Single Sign-On integration',
        'Unlimited processing credits',
        'Bespoke SLA performance logs',
        '24/7 dedicated support staff'
      ]
    }
  ];

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState(null); // { percentage, discountAmount, finalPrice }
  const [gstDetails, setGstDetails] = useState({
    companyName: 'SaaS DevKit LLC',
    billingAddress: '500 Technology Dr, Bangalore, KA, India',
    gstIn: '29AABCR1234M1ZS'
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleOpenCheckout = async (plan) => {
    setSelectedPlan(plan);
    setCouponCode('');
    setDiscountStatus({
      percentage: 0,
      discountAmount: 0,
      finalPrice: plan.price
    });
    setCheckoutModalOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const calc = await applyCouponCode(selectedPlan.id, couponCode, selectedPlan.price);
    setDiscountStatus(calc);
  };

  const handleConfirmCheckout = async () => {
    setCheckoutLoading(true);
    setTimeout(async () => {
      const res = await checkoutPlan(
        selectedPlan.id,
        'month',
        couponCode,
        discountStatus,
        gstDetails
      );
      setCheckoutLoading(false);
      setCheckoutModalOpen(false);
      alert(`Success! Upgraded plan to ${selectedPlan.name}. Added credits balance allowance.`);
    }, 1500);
  };

  // ------------------------------------------------------------------
  // NEW: GitHub search & repository explorer variables
  // ------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [repoFilter, setRepoFilter] = useState('all'); // all, public, private
  const [branchSelections, setBranchSelections] = useState({});

  const filteredRepos = githubDetails.repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          repo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = repoFilter === 'all' || repo.visibility === repoFilter;
    return matchesSearch && matchesVisibility;
  });

  const handleImportRepo = (repoName) => {
    const selectedBranch = branchSelections[repoName] || 'main';
    syncGitHubRepository(repoName, selectedBranch);
    alert(`Repository "${repoName}" registered under branch "${selectedBranch}". Commencing background scans...`);
  };

  const downloadTextFile = (invoiceNum) => {
    const invoice = billingDetails.invoices.find(inv => inv.invoiceNumber === invoiceNum);
    if (!invoice) return;

    const invoiceText = `
======================================================
                 REPOMIND AI TAX INVOICE
======================================================
Invoice Number: ${invoice.invoiceNumber}
Invoice Date:   ${invoice.date}
Payment Status: ${invoice.status.toUpperCase()}
======================================================
CUSTOMER DETAILS:
Company Name:    ${invoice.companyName}
Billing Address: ${invoice.billingAddress}
GSTIN:           ${invoice.gstIn}
======================================================
ITEM DESCRIPTION:
SaaS Subscription: RepoMind AI ${invoice.planId.toUpperCase()} Plan
Billing Interval:   Monthly
======================================================
PRICING DETAILS:
Base Charge:   $${(invoice.amount / 1.18).toFixed(2)}
GST (18% IGST): $${invoice.gstAmount.toFixed(2)}
------------------------------------------------------
Total Paid:    $${invoice.amount.toFixed(2)}
======================================================
Thank you for subscribing to RepoMind AI!
======================================================
`;
    
    const element = document.createElement("a");
    const file = new Blob([invoiceText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoiceNum}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* collapsible Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Settings panel */}
      <div 
        className="flex-1 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 76 : 260 }}
      >
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="border-b border-border/40 pb-6">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Configurations Interface</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              System Configurations
            </h1>
          </div>

          {/* Core Configuration Split */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            
            {/* Left Tabs selection */}
            <div className="md:col-span-1 flex flex-col space-y-1 bg-zinc-900/60 border border-border/60 p-2 rounded-2xl">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden ${
                      isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSettingsTab"
                        className="absolute inset-0 bg-zinc-800/80 border border-border/40 rounded-xl z-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 z-10 text-indigo-400" />
                    <span className="z-10">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content Panel */}
            <div className="md:col-span-3 glass-panel border border-border/80 rounded-3xl p-8 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {/* 1. Profile details panel */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 flex-1 animate-fade-in"
                  >
                    <div className="border-b border-border/30 pb-3 text-left">
                      <h3 className="text-sm font-bold text-white">Profile Details</h3>
                      <p className="text-xs text-zinc-500">Update account credentials and user profile information.</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Organization</label>
                        <input
                          type="text"
                          required
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Designation</label>
                        <input
                          type="text"
                          required
                          value={profile.role}
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-4">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 2. API key generator panel */}
                {activeTab === 'api-keys' && (
                  <motion.div
                    key="api-keys"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 flex-1"
                  >
                    <div className="border-b border-border/30 flex justify-between items-center text-left pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">API Key Manager</h3>
                        <p className="text-xs text-zinc-500">Expose keys to configure continuous deployment blueprints.</p>
                      </div>
                      <button
                        onClick={handleAddKey}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-border hover:bg-zinc-800 text-xs font-bold text-white transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Generate Key</span>
                      </button>
                    </div>

                    <div className="space-y-3.5 text-left">
                      {keys.map((k) => (
                        <div
                          key={k.id}
                          className="p-4 bg-zinc-950 border border-border rounded-2xl flex items-center justify-between gap-4 relative overflow-hidden"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-white">{k.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">{k.val}</p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                              Created: {k.created}
                            </span>
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/40 hover:bg-rose-500/5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. NEW: GitHub Integration Tab */}
                {activeTab === 'github' && (
                  <motion.div
                    key="github"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 flex-1 text-left"
                  >
                    <div className="border-b border-border/30 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-white">GitHub Integration</h3>
                        <p className="text-xs text-zinc-500">Link OAuth pipelines and configure automated webhook triggers.</p>
                      </div>
                      
                      {githubDetails.isConnected && (
                        <button
                          onClick={disconnectGitHub}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    {!githubDetails.isConnected ? (
                      <div className="py-10 flex flex-col items-center justify-center text-center space-y-6 bg-zinc-950/60 border border-dashed border-border rounded-3xl">
                        <div className="p-4 rounded-full bg-zinc-900 border border-border text-zinc-400 animate-pulse">
                          <Github className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                          <h4 className="text-sm font-bold text-white">Connect Connected GitHub Profile</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            Authorizing RepoMind AI grants checkout integrations access to read private, public, and organization repositories.
                          </p>
                        </div>
                        
                        <button
                          onClick={connectGitHub}
                          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-all shadow-xl active:scale-[0.98] hover:scale-[1.01]"
                        >
                          <Github className="w-4 h-4" />
                          <span>Link Account OAuth</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-fade-in">
                        {/* Profile Meta Info */}
                        <div className="p-5 bg-zinc-950 border border-border rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={githubDetails.avatarUrl} 
                              alt="github avatar" 
                              className="w-12 h-12 rounded-xl border border-border bg-zinc-800 shrink-0" 
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-white">{githubDetails.username}</h4>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-extrabold uppercase text-emerald-400">Linked</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Scopes granted: repo, user, write:repo_hook</p>
                            </div>
                          </div>
                        </div>

                        {/* Monitored Repos ledger */}
                        {githubDetails.syncedRepos.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                              Monitored Repositories
                            </h4>
                            <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-zinc-900">
                              {githubDetails.syncedRepos.map(repo => (
                                <div key={repo.id} className="p-4 bg-zinc-950/40 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-bold text-white">{repo.fullName}</span>
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-extrabold uppercase text-zinc-500 font-mono">
                                      {repo.defaultBranch}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3 text-zinc-500 font-semibold font-mono text-[10px]">
                                    <span className="text-emerald-400">Webhook Active</span>
                                    <span className="text-zinc-600">|</span>
                                    <span>Last Sync: {repo.lastSynced}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Repository Discovery Explorer */}
                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-900 pb-3">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">GitHub Repository Explorer</h4>
                              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Scan and import projects to register continuous webhooks.</p>
                            </div>

                            {/* Visibility filters */}
                            <div className="flex bg-zinc-900/60 p-0.5 rounded-lg border border-border/50 shrink-0 text-[10px]">
                              {['all', 'public', 'private'].map(f => (
                                <button
                                  key={f}
                                  onClick={() => setRepoFilter(f)}
                                  className={`px-3 py-1 rounded font-bold uppercase tracking-wide transition-all ${
                                    repoFilter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Search box */}
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                              <Search className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search repositories by name..."
                              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Repositories grid list */}
                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {filteredRepos.map(repo => {
                              const isSynced = githubDetails.syncedRepos.some(r => r.name === repo.name);
                              return (
                                <div
                                  key={repo.id}
                                  className="p-3.5 bg-zinc-950 border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative overflow-hidden"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <h5 className="text-xs font-bold text-white">{repo.fullName}</h5>
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-widest ${
                                        repo.visibility === 'private' ? 'bg-rose-500/15 border border-rose-500/20 text-rose-400' : 'bg-blue-500/10 border border-blue-500/20 text-indigo-400'
                                      }`}>
                                        {repo.visibility}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-semibold font-mono flex items-center space-x-2">
                                      <span>★ {repo.starsCount}</span>
                                      <span>•</span>
                                      <span>{repo.primaryLanguage}</span>
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0">
                                    <div className="relative">
                                      <select
                                        disabled={isSynced}
                                        value={branchSelections[repo.name] || repo.defaultBranch}
                                        onChange={(e) => setBranchSelections({ ...branchSelections, [repo.name]: e.target.value })}
                                        className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-zinc-300 focus:outline-none disabled:opacity-50"
                                      >
                                        <option value="main">main</option>
                                        <option value="master">master</option>
                                        <option value="prod">prod</option>
                                      </select>
                                    </div>

                                    {isSynced ? (
                                      <button
                                        onClick={() => handleImportRepo(repo.name)}
                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/25 transition-all"
                                      >
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        <span>Synced</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleImportRepo(repo.name)}
                                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-border hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95"
                                      >
                                        Import & Scan
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Push events webhook activity trace */}
                        {githubDetails.syncLogs.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Webhook Pushes Trace Activity Logs</h4>
                            <div className="glass-panel border border-border rounded-2xl overflow-hidden shadow-xl text-[10px] text-zinc-300">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-zinc-950 border-b border-border text-zinc-500 uppercase tracking-widest text-[8px] font-bold">
                                    <th className="px-4 py-3.5">Repository</th>
                                    <th className="px-4 py-3.5">Commit Hash</th>
                                    <th className="px-4 py-3.5">Author</th>
                                    <th className="px-4 py-3.5">Push Message</th>
                                    <th className="px-4 py-3.5">Re-analysis Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                  {githubDetails.syncLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-zinc-900/30">
                                      <td className="px-4 py-3 font-bold text-white">{log.repoName}</td>
                                      <td className="px-4 py-3 font-mono text-zinc-500">{log.commitHash}</td>
                                      <td className="px-4 py-3 text-indigo-400">@{log.author}</td>
                                      <td className="px-4 py-3 truncate max-w-[200px]" title={log.message}>{log.message}</td>
                                      <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-extrabold uppercase">SUCCESS</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. Dynamic Billing & Plan panel */}
                {activeTab === 'billing' && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 flex-1 text-left"
                  >
                    <div className="border-b border-border/30 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-white">Billing & Plan</h3>
                        <p className="text-xs text-zinc-500">Monitor active subscription details, balance allowances, and renewals.</p>
                      </div>
                      
                      {/* Credits Allowance Widget */}
                      <div className="flex items-center space-x-2 bg-zinc-950 border border-border px-4 py-2.5 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                        <Coins className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Credit Balance</p>
                          <p className="text-sm font-extrabold text-white font-mono mt-1">{billingDetails.creditBalance} CR</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Subscription Info */}
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-indigo-500/25 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                      <div className="absolute inset-0 aura-glow-1 opacity-20 pointer-events-none" />
                      
                      <div className="space-y-1.5 z-10">
                        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                          <span>Active Tier subscription</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">
                          RepoMind AI {billingDetails.activePlan.toUpperCase()}
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium">Billed monthly. Standard auto renew intervals active.</p>
                      </div>

                      <div className="shrink-0 z-10 flex flex-col items-end">
                        <span className="text-2xl font-extrabold text-white font-mono">
                          ${billingDetails.activePlan === 'free' ? 0 : billingDetails.activePlan === 'pro' ? 29 : billingDetails.activePlan === 'team' ? 99 : 299}/mo
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Pricing Tier Selection grid */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1 text-indigo-400 animate-pulse" />
                        Upgrade Tier plans levels
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pricingPlans.map(plan => {
                          const isActive = billingDetails.activePlan === plan.id;
                          return (
                            <div
                              key={plan.id}
                              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                                isActive 
                                  ? 'bg-zinc-950 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)]' 
                                  : 'bg-[#111113]/50 border-border/80 hover:border-zinc-700'
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start">
                                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">{plan.name}</h5>
                                  <span className="text-lg font-extrabold text-white font-mono">${plan.price}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-relaxed">{plan.description}</p>
                                
                                <ul className="mt-4 space-y-2 text-[10px] font-semibold text-zinc-400">
                                  {plan.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-center space-x-1.5">
                                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="mt-6">
                                {isActive ? (
                                  <button
                                    disabled
                                    className="w-full py-2 bg-zinc-900 border border-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-not-allowed"
                                  >
                                    Active Plan
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenCheckout(plan)}
                                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
                                  >
                                    Select {plan.name}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Credit Ledger transactions audit list */}
                    {billingDetails.creditTransactions.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                          <Coins className="w-4 h-4 mr-1 text-indigo-400" />
                          Credit Transactions Ledger
                        </h4>
                        
                        <div className="glass-panel border border-border rounded-2xl overflow-hidden shadow-xl text-[10px] text-zinc-300">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-zinc-950 border-b border-border text-zinc-500 uppercase tracking-widest text-[8px] font-bold">
                                <th className="px-4 py-3.5">Transaction Type</th>
                                <th className="px-4 py-3.5">Details</th>
                                <th className="px-4 py-3.5">Timestamp</th>
                                <th className="px-4 py-3.5 text-right">Credits amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {billingDetails.creditTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-zinc-900/30">
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                      tx.amount > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                    }`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-zinc-400">{tx.description}</td>
                                  <td className="px-4 py-3 font-medium text-zinc-500">{tx.timestamp}</td>
                                  <td className={`px-4 py-3 font-mono font-bold text-right ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tax Invoices compilation list */}
                    {billingDetails.invoices.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                          <Receipt className="w-4 h-4 mr-1 text-indigo-400" />
                          Printable GST Invoices History
                        </h4>
                        
                        <div className="glass-panel border border-border rounded-2xl overflow-hidden shadow-xl text-[10px] text-zinc-300">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-zinc-950 border-b border-border text-zinc-500 uppercase tracking-widest text-[8px] font-bold">
                                <th className="px-4 py-3.5">Invoice Number</th>
                                <th className="px-4 py-3.5">Billing Date</th>
                                <th className="px-4 py-3.5">GST Rate</th>
                                <th className="px-4 py-3.5">GST Amt</th>
                                <th className="px-4 py-3.5">Total Paid</th>
                                <th className="px-4 py-3.5 text-right">Download</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {billingDetails.invoices.map(inv => (
                                <tr key={inv.invoiceNumber} className="hover:bg-zinc-900/30">
                                  <td className="px-4 py-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                                  <td className="px-4 py-3 text-zinc-500 font-medium">{inv.date}</td>
                                  <td className="px-4 py-3 text-zinc-400 font-semibold font-mono">18% IGST</td>
                                  <td className="px-4 py-3 text-zinc-400 font-bold font-mono">${inv.gstAmount}</td>
                                  <td className="px-4 py-3 text-indigo-400 font-extrabold font-mono">${inv.amount}</td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => downloadTextFile(inv.invoiceNumber)}
                                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-border text-zinc-400 hover:text-white transition-colors"
                                      title="Download GST Invoice"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. Notification settings panel */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 flex-1 text-left"
                  >
                    <div className="border-b border-border/30 pb-3 text-left">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      <p className="text-xs text-zinc-500">Configure continuous log summaries and email alerts alerts.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-2xl">
                        <div>
                          <h4 className="text-xs font-bold text-white">Email Compilation Digests</h4>
                          <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">Receive structured PDF summary attachments upon successfully analyzing codebases.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded bg-zinc-900 border-border text-indigo-600 focus:ring-indigo-500" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-2xl">
                        <div>
                          <h4 className="text-xs font-bold text-white">API Usage Alerts</h4>
                          <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">Send immediate notification updates if query targets reach 80% parameter allowances.</p>
                        </div>
                        <input type="checkbox" className="rounded bg-zinc-900 border-border text-indigo-600 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------
          NEW: Premium Checkout overlay modal
      ------------------------------------------------------------------ */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-panel border border-border/90 rounded-3xl p-6 relative text-left"
            >
              {/* Header */}
              <div className="border-b border-border/30 pb-4 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Checkout Plan upgrade</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Complete licensing payment via secure gateways</p>
                </div>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                {/* Upgrade preview card */}
                <div className="p-4 bg-zinc-950 border border-border rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">Selected: RepoMind AI {selectedPlan?.name}</span>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Billed Monthly intervals</p>
                  </div>
                  <span className="text-sm font-extrabold text-white font-mono">${selectedPlan?.price}/mo</span>
                </div>

                {/* GST Details Input */}
                <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-800 rounded-2xl text-[10px] font-semibold text-zinc-400">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center mb-1">
                    <Receipt className="w-3.5 h-3.5 mr-1" />
                    GST Tax Details Configurations
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <label>Company Legal Name</label>
                      <input
                        type="text"
                        value={gstDetails.companyName}
                        onChange={(e) => setGstDetails({ ...gstDetails, companyName: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label>Billing Physical Address</label>
                      <input
                        type="text"
                        value={gstDetails.billingAddress}
                        onChange={(e) => setGstDetails({ ...gstDetails, billingAddress: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label>GSTIN ID Number (Optional)</label>
                      <input
                        type="text"
                        value={gstDetails.gstIn}
                        onChange={(e) => setGstDetails({ ...gstDetails, gstIn: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Coupons Discount Code field */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Apply Discount Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. STUDENT20"
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-border rounded-xl text-xs text-white placeholder-zinc-700 uppercase focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-border hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Live Checkout Summary */}
                {discountStatus && (
                  <div className="p-4 bg-zinc-950 border border-border/80 rounded-2xl space-y-2 text-[10px] font-semibold text-zinc-400">
                    <div className="flex justify-between">
                      <span>Base Plan Price:</span>
                      <span className="font-mono">$ {selectedPlan?.price.toFixed(2)}</span>
                    </div>

                    {discountStatus.percentage > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount Code applied (-{discountStatus.percentage}%):</span>
                        <span className="font-mono">- $ {discountStatus.discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>GST (18% Integrated GST):</span>
                      <span className="font-mono">$ {(discountStatus.finalPrice * 0.18).toFixed(2)}</span>
                    </div>

                    <div className="border-t border-zinc-800/80 my-2 pt-2 flex justify-between text-white text-xs font-bold">
                      <span>Total Invoice Amount:</span>
                      <span className="font-mono text-indigo-400">
                        $ {(discountStatus.finalPrice * 1.18).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <div className="mt-6 pt-4 border-t border-border/30">
                <button
                  onClick={handleConfirmCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay & Confirm Checkout</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
