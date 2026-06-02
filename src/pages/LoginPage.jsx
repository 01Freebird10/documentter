import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Chrome, Github } from '../components/BrandIcons';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || 'Invalid email or password.');
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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full aura-glow-1 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full aura-glow-2 translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-zinc-900 border border-border mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to analyze your codebases with RepoMind AI
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
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
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/60 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
                <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
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
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/60 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group py-3 rounded-xl text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 w-full h-[1px] bg-zinc-800" />
            <span className="relative z-10 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-surface">Or Continue With</span>
          </div>

          {/* Social Sign In */}
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
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
