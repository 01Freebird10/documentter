import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  History, 
  FileCheck2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Database,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'New Project', icon: FolderGit2, path: '/upload' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Analysis History', icon: History, path: '/history' },
    { name: 'Generated Documents', icon: FileCheck2, path: '/documents' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 bg-surface border-r border-border flex flex-col justify-between"
    >
      <div>
        {/* Toggle Button */}
        <div className="flex justify-end p-3 border-b border-border/40">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-border hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent hover:border-border/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active highlight */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-indigo-500/25 rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon className={`w-5 h-5 z-10 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`} />
                  
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="z-10 tracking-wide"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Live Status */}
      <div className="p-4 border-t border-border/40 space-y-4">
        {/* Connection status */}
        {!isCollapsed && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="tracking-wide">AI Core: Online</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-border text-zinc-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white">Alex Mercer</p>
                <p className="text-[10px] text-zinc-500 truncate">alex.m@repomind.ai</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
