import path from 'path';
import { readFileText } from './parserService.js';

export const detectTechnologies = (files) => {
  const detected = [];
  
  // 1. Locate and parse package.json if it exists
  const pkgFile = files.find(f => f.name === 'package.json');
  let dependencies = {};
  let devDependencies = {};

  if (pkgFile) {
    try {
      const content = JSON.parse(readFileText(pkgFile.path));
      dependencies = content.dependencies || {};
      devDependencies = content.devDependencies || {};
    } catch (e) {
      console.error('[JSON ERROR] Failed parsing package.json dependencies.');
    }
  }

  // Helper evaluator
  const matchDep = (lib) => !!dependencies[lib] || !!devDependencies[lib];

  // ==========================================
  // TECHNOLOGY CLASSIFICATION RULES
  // ==========================================

  // Frontend Frameworks
  if (matchDep('next')) {
    detected.push({ name: 'Next.js', type: 'Frontend Framework', confidence: 0.95 });
  } else if (matchDep('react') || files.some(f => f.ext === '.jsx')) {
    detected.push({ name: 'React', type: 'Frontend Framework', confidence: 0.9 });
  }
  if (matchDep('@angular/core')) {
    detected.push({ name: 'Angular', type: 'Frontend Framework', confidence: 0.95 });
  }
  if (matchDep('vue')) {
    detected.push({ name: 'Vue', type: 'Frontend Framework', confidence: 0.95 });
  }

  // Backend Frameworks
  if (matchDep('express')) {
    detected.push({ name: 'Express.js', type: 'Backend Framework', confidence: 0.95 });
  }
  if (matchDep('@nestjs/core')) {
    detected.push({ name: 'NestJS', type: 'Backend Framework', confidence: 0.95 });
  }
  if (files.some(f => f.ext === '.py')) {
    let framework = 'Python';
    let conf = 0.8;
    
    // Check python requirements
    const reqs = files.find(f => f.name === 'requirements.txt');
    if (reqs) {
      const content = readFileText(reqs.path);
      if (content.includes('django')) {
        framework = 'Django';
        conf = 0.95;
      } else if (content.includes('flask')) {
        framework = 'Flask';
        conf = 0.95;
      } else if (content.includes('fastapi')) {
        framework = 'FastAPI';
        conf = 0.95;
      }
    }
    detected.push({ name: framework, type: 'Backend Framework', confidence: conf });
  } else if (pkgFile || files.some(f => f.ext === '.js' || f.ext === '.ts')) {
    detected.push({ name: 'Node.js', type: 'Backend Framework', confidence: 0.85 });
  }

  // Databases
  if (matchDep('mongoose') || matchDep('mongodb')) {
    detected.push({ name: 'MongoDB', type: 'Database Dialect', confidence: 0.95 });
  }
  if (matchDep('pg') || matchDep('pg-promise')) {
    detected.push({ name: 'PostgreSQL', type: 'Database Dialect', confidence: 0.95 });
  }
  if (matchDep('mysql') || matchDep('mysql2')) {
    detected.push({ name: 'MySQL', type: 'Database Dialect', confidence: 0.95 });
  }
  if (matchDep('redis') || matchDep('ioredis')) {
    detected.push({ name: 'Redis', type: 'Database Dialect', confidence: 0.9 });
  }

  // Authentication
  if (matchDep('jsonwebtoken') || matchDep('jose')) {
    detected.push({ name: 'JWT Authentication', type: 'Security Protocol', confidence: 0.9 });
  }
  if (matchDep('passport')) {
    detected.push({ name: 'Passport OAuth', type: 'Security Protocol', confidence: 0.95 });
  }
  if (matchDep('firebase') || matchDep('firebase-admin')) {
    detected.push({ name: 'Firebase Auth', type: 'Security Protocol', confidence: 0.95 });
  }
  if (matchDep('@clerk/nextjs') || matchDep('@clerk/clerk-sdk-node')) {
    detected.push({ name: 'Clerk Auth', type: 'Security Protocol', confidence: 0.95 });
  }
  if (matchDep('@supabase/supabase-js')) {
    detected.push({ name: 'Supabase Auth', type: 'Security Protocol', confidence: 0.95 });
  }

  // Deployment & Hosting
  if (files.some(f => f.name === 'Dockerfile' || f.name === 'docker-compose.yml')) {
    detected.push({ name: 'Docker Containers', type: 'Deployment Target', confidence: 0.98 });
  }
  if (files.some(f => f.name === 'k8s' || f.name.endsWith('.k8s.yml'))) {
    detected.push({ name: 'Kubernetes Nodes', type: 'Deployment Target', confidence: 0.9 });
  }
  if (files.some(f => f.name === 'vercel.json') || matchDep('@vercel/analytics')) {
    detected.push({ name: 'Vercel Platform', type: 'Deployment Target', confidence: 0.95 });
  }

  // Fallback default node stack if nothing detected
  if (detected.length === 0) {
    detected.push({ name: 'Node.js', type: 'Backend Framework', confidence: 0.5 });
  }

  return detected;
};
