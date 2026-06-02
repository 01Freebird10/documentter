import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const handleScroll = (href) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-border/60 bg-[#09090B]/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 p-[1px] group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
              <div className="absolute inset-0 bg-indigo-500/30 blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              RepoMind<span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#')) {
                    e.preventDefault();
                    handleScroll(link.href);
                  }
                }}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-white ${
                  location.pathname === link.href ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/upload"
              className="relative group px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg transition-transform active:scale-95"
            >
              <span className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              Analyze Project
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 focus:outline-none"
            >
              {isOpen ? <X className="h-5 h-5" /> : <Menu className="h-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-border/80"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith('/#')) {
                      e.preventDefault();
                      handleScroll(link.href);
                    } else {
                      setIsOpen(false);
                    }
                  }}
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/40"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-zinc-800/50 px-3 flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                >
                  Analyze Project
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
