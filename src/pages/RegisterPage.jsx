import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { Chrome, Github } from '../components/BrandIcons';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength checkers
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-rose-500' });
  const [checks, setChecks] = useState({
    length: false,
    number: false,
    special: false,
    upper: false
  });

  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    setChecks({
      length: hasLength,
      number: hasNumber,
      special: hasSpecial,
      upper: hasUpper
    });

    let score = 0;
    if (hasLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (hasUpper) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score === 2 || score === 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || strength.score < 2) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed.');
      }
      
      // Store token & user profile info in localStorage
      localStorage.setItem('accessToken', resData.data.accessToken);
      localStorage.setItem('refreshToken', resData.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(resData.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Network error: Make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 overflow-hidden pt-16">
      {/* Glow Effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full aura-glow-2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full aura-glow-1 translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 my-8"
      >
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-zinc-900 border border-border mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Start generating beautiful enterprise codebase summaries
          </p>
        </div>

        {/* Auth Box */}
        <div className="glass-panel border border-border/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 flex items-center space-x-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Password strength visualizer */}
              {password.length > 0 && (
                <div className="pt-2 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Strength: <span className="font-semibold text-zinc-300">{strength.label}</span></span>
                    <span className="text-[10px] text-zinc-500">{strength.score}/4 criteria</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex space-x-[2px]">
                    <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-semibold text-zinc-400">
                    <div className="flex items-center space-x-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${checks.length ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                      <span>Min 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${checks.upper ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${checks.number ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                      <span>Contains a number</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${checks.special ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                      <span>Special symbol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-1 rounded bg-zinc-900 border-border text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-xs text-zinc-400 font-medium">
                I agree to the <a href="#terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and <a href="#privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
              </label>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isLoading || password.length === 0 || strength.score < 2}
              className="w-full relative group py-3 mt-2 rounded-xl text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 w-full h-[1px] bg-zinc-800" />
            <span className="relative z-10 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-surface">Or Register With</span>
          </div>

          {/* Social Register */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => { navigate('/dashboard'); }, 1000);
              }}
              className="flex items-center justify-center space-x-2 py-2.5 bg-zinc-900 border border-border rounded-xl hover:border-indigo-500/50 hover:bg-zinc-800/40 text-sm text-zinc-300 hover:text-white transition-all active:scale-[0.98]"
            >
              <Github className="w-4 h-4 text-white" />
              <span>GitHub</span>
            </button>
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => { navigate('/dashboard'); }, 1000);
              }}
              className="flex items-center justify-center space-x-2 py-2.5 bg-zinc-900 border border-border rounded-xl hover:border-indigo-500/50 hover:bg-zinc-800/40 text-sm text-zinc-300 hover:text-white transition-all active:scale-[0.98]"
            >
              <Chrome className="w-4 h-4 text-rose-500" />
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <p className="text-center mt-6 text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
