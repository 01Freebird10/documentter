import React, { useState } from 'react';
import { Network, Server, Database, Key, Layout, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchitectureViewer() {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    {
      id: 'routes',
      label: '/routes Gateway',
      cx: 110,
      cy: 110,
      icon: Server,
      tech: 'Express Router / API endpoints',
      description: 'Handles 14 API service channels. Directs incoming payloads to specific controllers.',
      complexity: 'Medium (B+)',
      filesCount: 8,
      connections: ['controllers', 'middleware']
    },
    {
      id: 'controllers',
      label: '/controllers Logic',
      cx: 260,
      cy: 60,
      icon: Layers,
      tech: 'REST Service Controllers',
      description: 'Processes business operations. Orchestrates data updates and routes triggers.',
      complexity: 'High (A-)',
      filesCount: 12,
      connections: ['routes', 'models']
    },
    {
      id: 'models',
      label: '/models Database',
      cx: 410,
      cy: 110,
      icon: Database,
      tech: 'Prisma ORM / PostgreSQL schemas',
      description: 'Defines 6 data models (User, Project, Document). Manages database connections.',
      complexity: 'Low (A+)',
      filesCount: 4,
      connections: ['controllers']
    },
    {
      id: 'middleware',
      label: '/middleware Security',
      cx: 260,
      cy: 220,
      icon: Key,
      tech: 'JWT Token Validations',
      description: 'Intercepts requests to evaluate authorization headers and log usage patterns.',
      complexity: 'Medium (A)',
      filesCount: 5,
      connections: ['routes']
    },
    {
      id: 'components',
      label: '/components View',
      cx: 110,
      cy: 220,
      icon: Layout,
      tech: 'React 18 Dashboard Views',
      description: 'Renders dashboard operating modules, cards, and interactive results components.',
      complexity: 'High (S)',
      filesCount: 24,
      connections: ['routes']
    }
  ];

  return (
    <div className="glass-panel border border-border/80 rounded-3xl p-6 flex flex-col lg:flex-row gap-6 text-left relative overflow-hidden bg-black/35 min-h-[380px]">
      <div className="absolute inset-0 bg-radial-gradient-glow-blue opacity-30 pointer-events-none" />

      {/* SVG Interactive Canvas */}
      <div className="flex-1 min-h-[260px] relative border border-border/30 rounded-2xl bg-zinc-950/40 p-4">
        <svg className="w-full h-full min-h-[240px]" viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg">
          {/* Background Connecting Lines */}
          {nodes.map((node) => 
            node.connections.map((connId) => {
              const target = nodes.find(n => n.id === connId);
              if (!target) return null;
              
              const isHighlighted = hoveredNode && (hoveredNode.id === node.id || hoveredNode.id === target.id);

              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={node.cx}
                  y1={node.cy}
                  x2={target.cx}
                  y2={target.cy}
                  stroke={isHighlighted ? '#6366F1' : '#27272A'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  className={isHighlighted ? 'flow-line-animate' : ''}
                  strokeDasharray={isHighlighted ? '5,5' : 'none'}
                  transition="all 0.3s"
                />
              );
            })
          )}

          {/* Node Circles */}
          {nodes.map((node) => {
            const isHovered = hoveredNode && hoveredNode.id === node.id;
            const Icon = node.icon;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
              >
                {/* Ping animation rings */}
                {isHovered && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="26"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    className="animate-ping opacity-35"
                  />
                )}

                {/* Outer ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="20"
                  fill="#111113"
                  stroke={isHovered ? '#6366F1' : '#27272A'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-300"
                />

                {/* Interactive Inner circle */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="14"
                  fill={isHovered ? 'rgba(99,102,241,0.1)' : 'rgba(39,39,42,0.4)'}
                  className="transition-all duration-300"
                />

                {/* Node Icons */}
                <foreignObject
                  x={node.cx - 8}
                  y={node.cy - 8}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <Icon className={`w-4 h-4 transition-colors ${isHovered ? 'text-indigo-400' : 'text-zinc-400'}`} />
                </foreignObject>

                {/* Labels text */}
                <text
                  x={node.cx}
                  y={node.cy + 34}
                  textAnchor="middle"
                  className={`text-[9px] font-bold uppercase tracking-wider font-sans pointer-events-none transition-colors ${
                    isHovered ? 'fill-white font-semibold' : 'fill-zinc-500'
                  }`}
                >
                  {node.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
        
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 text-[9px] font-bold text-zinc-500 bg-zinc-950/60 border border-border/50 px-2 py-0.5 rounded-md">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Hover a cluster to examine routes</span>
        </div>
      </div>

      {/* Right Side: Information Panel */}
      <div className="w-full lg:w-72 flex flex-col justify-between p-1">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 border-b border-border/30 pb-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Sub-Cluster Details</span>
          </div>

          <AnimatePresence mode="wait">
            {hoveredNode ? (
              <motion.div
                key={hoveredNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3.5"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{hoveredNode.label}</h4>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{hoveredNode.tech}</p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {hoveredNode.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-semibold">
                  <div className="bg-zinc-900 border border-border/40 px-2.5 py-1.5 rounded-xl">
                    <p className="text-zinc-500 mb-0.5 uppercase tracking-wide">Files Detected</p>
                    <p className="text-xs font-mono font-bold text-white">{hoveredNode.filesCount}</p>
                  </div>
                  <div className="bg-zinc-900 border border-border/40 px-2.5 py-1.5 rounded-xl">
                    <p className="text-zinc-500 mb-0.5 uppercase tracking-wide">Complexity</p>
                    <p className="text-xs font-mono font-bold text-white">{hoveredNode.complexity}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-40 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl p-4 text-center text-zinc-500"
              >
                <Network className="w-6 h-6 text-zinc-600 mb-2 animate-pulse" />
                <p className="text-xs font-medium">Hover over the layout canvas to inspect specific directory parameters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global summary card */}
        <div className="border-t border-border/30 pt-4 mt-4 lg:mt-0 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center justify-between">
          <span>Active Connections</span>
          <span className="font-mono text-zinc-400">5 nodes / 5 edges</span>
        </div>
      </div>

    </div>
  );
}
