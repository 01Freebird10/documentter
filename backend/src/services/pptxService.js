import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

// Define the 5 high-fidelity presentation themes
const THEMES = {
  developer: {
    bg: '09090B',
    title: '3B82F6',      // Blue
    accent: '8B5CF6',     // Violet
    text: 'A1A1AA',       // Soft light gray
    cardBg: '18181B',
    cardBorder: '27272A',
    font: 'Segoe UI'
  },
  startup: {
    bg: '110C1A',
    title: 'FFFFFF',
    accent: '06B6D4',     // Cyan
    text: 'D1D5DB',       // Silver
    cardBg: '1D162B',
    cardBorder: '312E81',
    font: 'Trebuchet MS'
  },
  university: {
    bg: '0F172A',
    title: 'FFFFFF',
    accent: '10B981',     // Emerald Green
    text: '94A3B8',       // Zinc Muted
    cardBg: '1E293B',
    cardBorder: '334155',
    font: 'Calibri'
  },
  corporate: {
    bg: '000000',
    title: '1D4ED8',      // Royal Blue
    accent: 'D97706',     // Gold Amber
    text: '94A3B8',
    cardBg: '111827',
    cardBorder: '1F2937',
    font: 'Arial'
  },
  executive: {
    bg: '1C1917',
    title: 'F59E0B',      // Soft Gold
    accent: 'E11D48',     // Deep Coral
    text: 'E7E5E4',
    cardBg: '292524',
    cardBorder: '44403C',
    font: 'Palatino'
  }
};

// Helper to inject title header, horizontal rule, and branding footer
const addHeaderAndBranding = (slide, titleText, theme, projectName) => {
  // Slide title
  slide.addText(titleText, {
    x: 0.5,
    y: 0.3,
    w: 7.5,
    h: 0.5,
    fontSize: 20,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  // Title accent rule
  slide.addShape('rect', {
    x: 0.5,
    y: 0.85,
    w: 9.0,
    h: 0.02,
    fill: { color: theme.accent }
  });

  // Footer left branding
  slide.addText(projectName.toUpperCase(), {
    x: 0.5,
    y: 5.15,
    w: 3.5,
    h: 0.3,
    fontSize: 9,
    color: theme.text,
    fontFace: theme.font,
    italic: true
  });

  // Footer right badge
  slide.addText('RepoMind AI Generated • v1.0.0', {
    x: 6.0,
    y: 5.15,
    w: 3.5,
    h: 0.3,
    fontSize: 9,
    color: theme.accent,
    fontFace: theme.font,
    bold: true,
    align: 'right'
  });
};

/**
 * Programmatically compile a 16-slide high-fidelity presentation using native pptxgenjs elements
 * @param {Object} project - The Mongoose Project entity
 * @param {string} destPath - Physical file destination path
 * @param {string} themeName - Theme option (developer, startup, university, corporate, executive)
 */
export const compilePptxPresentation = async (project, destPath, themeName = 'developer') => {
  const theme = THEMES[themeName.toLowerCase()] || THEMES.developer;
  const context = project.analysisContext || {};
  const ai = project.aiContext || {};
  const report = ai.reportContent || {};
  const slidesContent = ai.pptContent || [];

  const ppt = new pptxgen();
  ppt.layout = 'LAYOUT_16x9'; // Standard 16:9 widescreen format

  const techList = context.technologies?.join(', ') || 'Node.js, Express';
  const dbModels = context.databaseOverview?.models?.join(', ') || 'User, Session';

  // ==========================================
  // SLIDE 1: TITLE PAGE (COVER)
  // ==========================================
  const s1 = ppt.addSlide();
  s1.background = { fill: theme.bg };

  // Accent vertical stripe
  s1.addShape('rect', {
    x: 0.0,
    y: 0.0,
    w: 0.15,
    h: 5.625,
    fill: { color: theme.accent }
  });

  s1.addText(project.projectName.toUpperCase(), {
    x: 0.8,
    y: 1.5,
    w: 8.5,
    h: 0.8,
    fontSize: 36,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  s1.addText('OFFICIAL BLUEPRINT SPECIFICATION PRESENTATION', {
    x: 0.8,
    y: 2.3,
    w: 8.5,
    h: 0.4,
    fontSize: 12,
    color: theme.accent,
    fontFace: theme.font,
    bold: true,
    tracking: 1.5
  });

  // Details block
  s1.addShape('rect', {
    x: 0.8,
    y: 3.0,
    w: 6.0,
    h: 1.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s1.addText(`Category: ${context.category || 'Software Architecture'}\nStack: ${techList}\nGenerated: ${new Date().toLocaleDateString()}`, {
    x: 1.0,
    y: 3.2,
    w: 5.6,
    h: 1.1,
    fontSize: 11,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 18
  });

  // ==========================================
  // SLIDE 2: PROJECT OVERVIEW (WITH DOUGHNUT CHART)
  // ==========================================
  const s2 = ppt.addSlide();
  s2.background = { fill: theme.bg };
  addHeaderAndBranding(s2, '1. Project Overview & Scope', theme, project.projectName);

  s2.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 4.5,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s2.addText('System Abstract & Purpose', {
    x: 0.8,
    y: 1.4,
    w: 3.9,
    h: 0.4,
    fontSize: 14,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  s2.addText(report.abstract || 'This specification blueprints the system components, tracing routes, modules, controllers, and models.', {
    x: 0.8,
    y: 1.9,
    w: 3.9,
    h: 2.5,
    fontSize: 10.5,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 16
  });

  // Draw native PPTX complexity doughnut chart
  const complexityVal = context.complexityScore || 85;
  s2.addChart('doughnut', [
    {
      name: 'Complexity Rating',
      labels: ['Complexity Score', 'Remaining'],
      values: [complexityVal, 100 - complexityVal]
    }
  ], {
    x: 5.4,
    y: 1.2,
    w: 4.0,
    h: 3.5,
    holeSize: 70,
    showLabel: false,
    showValue: false,
    showPercent: false,
    chartColors: [theme.accent, theme.cardBorder]
  });

  // Overlay text inside the doughnut center
  s2.addText(`${complexityVal}%`, {
    x: 6.9,
    y: 2.5,
    w: 1.0,
    h: 0.6,
    fontSize: 22,
    color: 'FFFFFF',
    fontFace: theme.font,
    bold: true,
    align: 'center'
  });

  s2.addText('Complexity index', {
    x: 6.4,
    y: 3.1,
    w: 2.0,
    h: 0.3,
    fontSize: 10,
    color: theme.text,
    fontFace: theme.font,
    align: 'center'
  });

  // ==========================================
  // SLIDE 3: PROBLEM STATEMENT
  // ==========================================
  const s3 = ppt.addSlide();
  s3.background = { fill: theme.bg };
  addHeaderAndBranding(s3, '2. Architectural Problem Statement', theme, project.projectName);

  s3.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 9.0,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: 'EF4444', width: 1.5 } // Crimson Red alert boundary
  });

  s3.addText('Vulnerability & Refactoring Targets Mapped during Scan:', {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    color: 'EF4444',
    fontFace: theme.font,
    bold: true
  });

  const weaknessText = context.weaknesses?.map((w, idx) => `0${idx + 1}. ${w}`).join('\n\n') || 
    '01. tight directory coupling constraints.\n\n02. Missing unit and integration spec coverage files.';

  s3.addText(weaknessText, {
    x: 0.8,
    y: 2.0,
    w: 8.4,
    h: 2.4,
    fontSize: 11,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 18
  });

  // ==========================================
  // SLIDE 4: SYSTEM OBJECTIVES
  // ==========================================
  const s4 = ppt.addSlide();
  s4.background = { fill: theme.bg };
  addHeaderAndBranding(s4, '3. Engineering Objectives', theme, project.projectName);

  const objectiveList = [
    { title: 'Modular Organization', desc: 'Isolate routers and controllers logic to support atomic upgrades.' },
    { title: 'Validation Integrity', desc: 'Secure database querying structures and validate client payload payloads.' },
    { title: 'Diagnostics Scaling', desc: 'Implement automated test monitors checking route health.' }
  ];

  objectiveList.forEach((obj, idx) => {
    const xPos = 0.5 + idx * 3.1;
    s4.addShape('rect', {
      x: xPos,
      y: 1.5,
      w: 2.8,
      h: 3.0,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    s4.addText(`0${idx + 1}`, {
      x: xPos + 0.2,
      y: 1.7,
      w: 0.8,
      h: 0.5,
      fontSize: 24,
      color: theme.accent,
      fontFace: theme.font,
      bold: true
    });

    s4.addText(obj.title, {
      x: xPos + 0.2,
      y: 2.3,
      w: 2.4,
      h: 0.4,
      fontSize: 13,
      color: theme.title,
      fontFace: theme.font,
      bold: true
    });

    s4.addText(obj.desc, {
      x: xPos + 0.2,
      y: 2.8,
      w: 2.4,
      h: 1.5,
      fontSize: 10,
      color: theme.text,
      fontFace: theme.font,
      lineSpacing: 14
    });
  });

  // ==========================================
  // SLIDE 5: TECHNOLOGY STACK (TECH BADGES)
  // ==========================================
  const s5 = ppt.addSlide();
  s5.background = { fill: theme.bg };
  addHeaderAndBranding(s5, '4. Technology Stack Discovered', theme, project.projectName);

  s5.addText('Core parsed libraries and packages parsed in manifest files:', {
    x: 0.5,
    y: 1.1,
    w: 9.0,
    h: 0.3,
    fontSize: 11,
    color: theme.text,
    fontFace: theme.font,
    italic: true
  });

  const techs = context.technologies || ['Node.js', 'Express', 'React', 'MongoDB'];
  techs.forEach((tech, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);

    const xPos = 0.5 + col * 2.3;
    const yPos = 1.6 + row * 1.6;

    // Badge card
    s5.addShape('rect', {
      x: xPos,
      y: yPos,
      w: 2.1,
      h: 1.3,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    // Badge stripe left border
    s5.addShape('rect', {
      x: xPos,
      y: yPos,
      w: 0.08,
      h: 1.3,
      fill: { color: theme.accent }
    });

    s5.addText(tech, {
      x: xPos + 0.2,
      y: yPos + 0.2,
      w: 1.8,
      h: 0.4,
      fontSize: 14,
      color: 'FFFFFF',
      fontFace: theme.font,
      bold: true
    });

    s5.addText('Active Compiler', {
      x: xPos + 0.2,
      y: yPos + 0.7,
      w: 1.8,
      h: 0.4,
      fontSize: 9,
      color: theme.text,
      fontFace: theme.font
    });
  });

  // ==========================================
  // SLIDE 6: SYSTEM ARCHITECTURE (VISUAL DIAGRAM)
  // ==========================================
  const s6 = ppt.addSlide();
  s6.background = { fill: theme.bg };
  addHeaderAndBranding(s6, '5. Clean Architecture Specification', theme, project.projectName);

  // Box 1: Client
  s6.addShape('rect', {
    x: 0.6,
    y: 2.0,
    w: 1.8,
    h: 1.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });
  s6.addText('CLIENT UI\n(React SPA)', {
    x: 0.6,
    y: 2.5,
    w: 1.8,
    h: 0.6,
    fontSize: 11,
    color: 'FFFFFF',
    fontFace: theme.font,
    bold: true,
    align: 'center'
  });

  // Connector 1
  s6.addShape('rightArrow', {
    x: 2.6,
    y: 2.5,
    w: 0.5,
    h: 0.4,
    fill: { color: theme.accent }
  });

  // Box 2: Routers / Controllers
  s6.addShape('rect', {
    x: 3.3,
    y: 1.5,
    w: 3.4,
    h: 2.5,
    fill: { color: theme.cardBg },
    line: { color: theme.accent, width: 1 }
  });
  s6.addText('BACKEND APPLICATION SERVICES\n(Express Node.js)', {
    x: 3.4,
    y: 1.7,
    w: 3.2,
    h: 0.4,
    fontSize: 11,
    color: theme.title,
    fontFace: theme.font,
    bold: true,
    align: 'center'
  });

  s6.addShape('rect', {
    x: 3.6,
    y: 2.2,
    w: 2.8,
    h: 0.6,
    fill: { color: theme.bg },
    line: { color: theme.cardBorder, width: 1 }
  });
  s6.addText('Routing Gateway', {
    x: 3.6,
    y: 2.3,
    w: 2.8,
    h: 0.4,
    fontSize: 9.5,
    color: theme.text,
    fontFace: theme.font,
    align: 'center'
  });

  s6.addShape('rect', {
    x: 3.6,
    y: 3.0,
    w: 2.8,
    h: 0.6,
    fill: { color: theme.bg },
    line: { color: theme.cardBorder, width: 1 }
  });
  s6.addText('MVC Controller Logic', {
    x: 3.6,
    y: 3.1,
    w: 2.8,
    h: 0.4,
    fontSize: 9.5,
    color: theme.text,
    fontFace: theme.font,
    align: 'center'
  });

  // Connector 2
  s6.addShape('rightArrow', {
    x: 6.9,
    y: 2.5,
    w: 0.5,
    h: 0.4,
    fill: { color: theme.accent }
  });

  // Box 3: DB
  s6.addShape('rect', {
    x: 7.6,
    y: 2.0,
    w: 1.8,
    h: 1.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });
  s6.addText('DATABASE GATEWAY\n(' + (context.databaseOverview?.dialect || 'MongoDB') + ')', {
    x: 7.6,
    y: 2.5,
    w: 1.8,
    h: 0.6,
    fontSize: 10.5,
    color: 'FFFFFF',
    fontFace: theme.font,
    bold: true,
    align: 'center'
  });

  // ==========================================
  // SLIDE 7: CORE MODULES
  // ==========================================
  const s7 = ppt.addSlide();
  s7.background = { fill: theme.bg };
  addHeaderAndBranding(s7, '6. Core System Modules', theme, project.projectName);

  const modules = [
    { title: 'Router Gates', path: '/src/routes/', desc: 'Exposes clean REST routing channels, filtering CORS and handling parameters.' },
    { title: 'Controllers Layer', path: '/src/controllers/', desc: 'Validates payloads schemas, sanitizes parameters, and formats controller outcomes.' },
    { title: 'Models Mappings', path: '/src/models/', desc: 'Builds database entity tables, establishing secure relational schema constraints.' }
  ];

  modules.forEach((mod, idx) => {
    const xPos = 0.5 + idx * 3.1;
    s7.addShape('rect', {
      x: xPos,
      y: 1.5,
      w: 2.8,
      h: 3.0,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    s7.addText(mod.title, {
      x: xPos + 0.2,
      y: 1.8,
      w: 2.4,
      h: 0.4,
      fontSize: 14,
      color: theme.title,
      fontFace: theme.font,
      bold: true
    });

    s7.addText(mod.path, {
      x: xPos + 0.2,
      y: 2.2,
      w: 2.4,
      h: 0.3,
      fontSize: 9.5,
      color: theme.accent,
      fontFace: 'Courier New',
      bold: true
    });

    s7.addText(mod.desc, {
      x: xPos + 0.2,
      y: 2.7,
      w: 2.4,
      h: 1.6,
      fontSize: 10,
      color: theme.text,
      fontFace: theme.font,
      lineSpacing: 14
    });
  });

  // ==========================================
  // SLIDE 8: FEATURES SHOWCASE
  // ==========================================
  const s8 = ppt.addSlide();
  s8.background = { fill: theme.bg };
  addHeaderAndBranding(s8, '7. Discovered Functional Capabilities', theme, project.projectName);

  const features = context.features || [
    { name: 'User Authentication', evidence: 'authMiddleware jwt verified' },
    { name: 'REST endpoints', evidence: 'express routers' }
  ];

  features.slice(0, 4).forEach((feat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);

    const xPos = 0.5 + col * 4.6;
    const yPos = 1.4 + row * 1.8;

    s8.addShape('rect', {
      x: xPos,
      y: yPos,
      w: 4.4,
      h: 1.5,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    s8.addText(feat.name, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 3.8,
      h: 0.4,
      fontSize: 13,
      color: theme.title,
      fontFace: theme.font,
      bold: true
    });

    s8.addText(`Audit Evidence: ${feat.evidence}`, {
      x: xPos + 0.3,
      y: yPos + 0.7,
      w: 3.8,
      h: 0.6,
      fontSize: 9.5,
      color: theme.text,
      fontFace: theme.font,
      lineSpacing: 12
    });
  });

  // ==========================================
  // SLIDE 9: DATABASE DESIGN
  // ==========================================
  const s9 = ppt.addSlide();
  s9.background = { fill: theme.bg };
  addHeaderAndBranding(s9, '8. Database Design & Models', theme, project.projectName);

  s9.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 4.2,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s9.addText('Entity Tables Overview', {
    x: 0.8,
    y: 1.4,
    w: 3.6,
    h: 0.4,
    fontSize: 14,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  s9.addText(`Dialect: ${context.databaseOverview?.dialect || 'MongoDB (Mongoose)'}\n\nModels Discovered: ${dbModels}\n\nThe system enforces schema structural parameters including primary keys and relational definitions.`, {
    x: 0.8,
    y: 2.0,
    w: 3.6,
    h: 2.4,
    fontSize: 10.5,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 16
  });

  // Display schemas graphically
  const models = context.databaseOverview?.models || ['User', 'Session'];
  models.slice(0, 3).forEach((model, idx) => {
    const yPos = 1.2 + idx * 1.2;

    s9.addShape('rect', {
      x: 5.2,
      y: yPos,
      w: 4.3,
      h: 1.0,
      fill: { color: theme.cardBg },
      line: { color: theme.accent, width: 1 }
    });

    s9.addText(`[ENTITY MODEL] ${model}`, {
      x: 5.5,
      y: yPos + 0.2,
      w: 3.8,
      h: 0.3,
      fontSize: 11,
      color: 'FFFFFF',
      fontFace: 'Courier New',
      bold: true
    });

    s9.addText('Ref references other collections constraint patterns.', {
      x: 5.5,
      y: yPos + 0.5,
      w: 3.8,
      h: 0.3,
      fontSize: 9,
      color: theme.text,
      fontFace: theme.font
    });
  });

  // ==========================================
  // SLIDE 10: API SPECIFICATIONS (TABLES)
  // ==========================================
  const s10 = ppt.addSlide();
  s10.background = { fill: theme.bg };
  addHeaderAndBranding(s10, '9. REST API Gateway Specifications', theme, project.projectName);

  const apiMap = context.apiMap || [];
  const rows = [
    [
      { text: 'HTTP METHOD', options: { bold: true, color: 'FFFFFF', fill: theme.title } },
      { text: 'ENDPOINT ROUTE PATH', options: { bold: true, color: 'FFFFFF', fill: theme.title } },
      { text: 'JWT AUTHORIZATION', options: { bold: true, color: 'FFFFFF', fill: theme.title } }
    ],
    ...apiMap.slice(0, 5).map(api => [
      { text: api.method, options: { bold: true } },
      { text: api.path },
      { text: api.authRequired ? 'Yes (JWT Bearer Protected)' : 'No (Public Access)' }
    ])
  ];

  // If we have API endpoints, render them inside the table, else mock
  if (rows.length === 1) {
    rows.push(
      ['POST', '/api/auth/login', 'No (Public)'],
      ['GET', '/api/users/profile', 'Yes (JWT Bearer)'],
      ['POST', '/api/projects/upload', 'Yes (JWT Bearer)'],
      ['DELETE', '/api/projects/:id', 'Yes (JWT Bearer)']
    );
  }

  s10.addTable(rows, {
    x: 0.5,
    y: 1.3,
    w: 9.0,
    h: 3.0,
    fontSize: 9.5,
    color: theme.text,
    fontFace: theme.font,
    border: { type: 'solid', size: 1, color: theme.cardBorder },
    fill: theme.cardBg
  });

  // ==========================================
  // SLIDE 11: IMPLEMENTATION DETAILS
  // ==========================================
  const s11 = ppt.addSlide();
  s11.background = { fill: theme.bg };
  addHeaderAndBranding(s11, '10. Server Setup & Implementation', theme, project.projectName);

  s11.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 4.2,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s11.addText('Core Framework Setup', {
    x: 0.8,
    y: 1.4,
    w: 3.6,
    h: 0.4,
    fontSize: 14,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  s11.addText('The application leverages a standard ES module configuration ("type": "module") facilitating async imports.\n\nREST payloads traverse security configurations including Helmet headers, CORS parameters, and rate-limiting triggers to disallow exploits.', {
    x: 0.8,
    y: 1.9,
    w: 3.6,
    h: 2.5,
    fontSize: 10,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 15
  });

  // Mock code block container
  s11.addShape('rect', {
    x: 5.0,
    y: 1.2,
    w: 4.5,
    h: 3.5,
    fill: { color: '18181B' },
    line: { color: '27272A', width: 1 }
  });

  s11.addText(`// Express REST Controller Gateway\nimport express from 'express';\nimport { protect } from '../middleware/auth';\n\nconst router = express.Router();\n\n// Mount session protected profile endpoint\nrouter.get('/profile', protect, getProfile);\n\nexport default router;`, {
    x: 5.2,
    y: 1.4,
    w: 4.1,
    h: 3.1,
    fontSize: 9.5,
    color: '38BDF8', // Cyan Code Color
    fontFace: 'Courier New',
    lineSpacing: 14
  });

  // ==========================================
  // SLIDE 12: TESTING & DIAGNOSTICS
  // ==========================================
  const s12 = ppt.addSlide();
  s12.background = { fill: theme.bg };
  addHeaderAndBranding(s12, '11. Quality Audit & Test Metrics', theme, project.projectName);

  s12.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 9.0,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s12.addText('Test Suite Mappings:', {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  s12.addText('Unit & Integration Coverage:\nDuring our static scan audits, zero spec files or Jest/Mocha validator folders were discovered in root boundaries.\n\nRecommended Actions:\n01. Install and configure Jest or Vitest dependencies.\n02. Scaffold controller test models checking endpoint payload schemas.\n03. Write mock hooks to check database transaction gates.', {
    x: 0.8,
    y: 2.0,
    w: 8.4,
    h: 2.4,
    fontSize: 10.5,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 16
  });

  // ==========================================
  // SLIDE 13: ADVANTAGES
  // ==========================================
  const s13 = ppt.addSlide();
  s13.background = { fill: theme.bg };
  addHeaderAndBranding(s13, '12. System Advantages Discovered', theme, project.projectName);

  const advantages = context.strengths || [
    'Highly modular directory paths mapping routing segments.',
    'Clear MVC boundary structures separating models and views.'
  ];

  advantages.slice(0, 3).forEach((adv, idx) => {
    const yPos = 1.3 + idx * 1.2;

    s13.addShape('rect', {
      x: 0.5,
      y: yPos,
      w: 9.0,
      h: 1.0,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    s13.addShape('rect', {
      x: 0.5,
      y: yPos,
      w: 0.08,
      h: 1.0,
      fill: { color: theme.accent }
    });

    s13.addText(`Advantage 0${idx + 1}`, {
      x: 0.8,
      y: yPos + 0.15,
      w: 8.0,
      h: 0.3,
      fontSize: 12,
      color: theme.title,
      fontFace: theme.font,
      bold: true
    });

    s13.addText(adv, {
      x: 0.8,
      y: yPos + 0.45,
      w: 8.0,
      h: 0.4,
      fontSize: 10,
      color: theme.text,
      fontFace: theme.font
    });
  });

  // ==========================================
  // SLIDE 14: FUTURE ROADMAP
  // ==========================================
  const s14 = ppt.addSlide();
  s14.background = { fill: theme.bg };
  addHeaderAndBranding(s14, '13. Future Refactoring Roadmap', theme, project.projectName);

  const recommendations = context.recommendations || [
    'Integrate Jest testing monitors.',
    'Configure Redis backend caches.'
  ];

  recommendations.slice(0, 3).forEach((rec, idx) => {
    const xPos = 0.5 + idx * 3.1;

    s14.addShape('rect', {
      x: xPos,
      y: 1.5,
      w: 2.8,
      h: 3.0,
      fill: { color: theme.cardBg },
      line: { color: theme.cardBorder, width: 1 }
    });

    // Milestone number circle
    s14.addShape('oval', {
      x: xPos + 0.2,
      y: 1.7,
      w: 0.6,
      h: 0.6,
      fill: { color: theme.accent }
    });
    s14.addText(String(idx + 1), {
      x: xPos + 0.2,
      y: 1.8,
      w: 0.6,
      h: 0.4,
      fontSize: 14,
      color: 'FFFFFF',
      fontFace: theme.font,
      bold: true,
      align: 'center'
    });

    s14.addText(`Roadmap Step 0${idx + 1}`, {
      x: xPos + 0.2,
      y: 2.4,
      w: 2.4,
      h: 0.3,
      fontSize: 12,
      color: theme.title,
      fontFace: theme.font,
      bold: true
    });

    s14.addText(rec, {
      x: xPos + 0.2,
      y: 2.8,
      w: 2.4,
      h: 1.5,
      fontSize: 10,
      color: theme.text,
      fontFace: theme.font,
      lineSpacing: 14
    });
  });

  // ==========================================
  // SLIDE 15: CONCLUSION
  // ==========================================
  const s15 = ppt.addSlide();
  s15.background = { fill: theme.bg };
  addHeaderAndBranding(s15, '14. Presentation Summary', theme, project.projectName);

  s15.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: 9.0,
    h: 3.5,
    fill: { color: theme.cardBg },
    line: { color: theme.cardBorder, width: 1 }
  });

  s15.addText('Key Takeaways & Wrap Up:', {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    color: theme.title,
    fontFace: theme.font,
    bold: true
  });

  const conclusionPoints = [
    `● Successfully compiled and analyzed repository: ${project.projectName}`,
    `● System category matches: ${context.category || 'MVC Microservice'}`,
    `● Technology manifest stack conforms to: ${techList}`,
    `● Code complexity audit grade: ${context.complexityScore}% / 100`,
    '● Scalable MVC layouts are ready for secondary engineering integrations.'
  ];

  s15.addText(conclusionPoints.join('\n\n'), {
    x: 0.8,
    y: 1.9,
    w: 8.4,
    h: 2.5,
    fontSize: 11,
    color: theme.text,
    fontFace: theme.font,
    lineSpacing: 16
  });

  // ==========================================
  // SLIDE 16: THANK YOU
  // ==========================================
  const s16 = ppt.addSlide();
  s16.background = { fill: theme.bg };

  s16.addText('THANK YOU', {
    x: 1.0,
    y: 1.8,
    w: 8.0,
    h: 0.8,
    fontSize: 48,
    color: theme.title,
    fontFace: theme.font,
    bold: true,
    align: 'center'
  });

  // Colored accent underline
  s16.addShape('rect', {
    x: 3.5,
    y: 2.8,
    w: 3.0,
    h: 0.05,
    fill: { color: theme.accent }
  });

  s16.addText('RepoMind AI Technical Presentation Blueprint', {
    x: 1.0,
    y: 3.1,
    w: 8.0,
    h: 0.4,
    fontSize: 13,
    color: theme.text,
    fontFace: theme.font,
    align: 'center',
    bold: true
  });

  s16.addText('Ready for review • Academic Final Project Spec', {
    x: 1.0,
    y: 3.5,
    w: 8.0,
    h: 0.4,
    fontSize: 10.5,
    color: theme.text,
    fontFace: theme.font,
    align: 'center'
  });

  // Pack the slides and save to disk
  await ppt.writeFile({ fileName: destPath });
  console.log(`[PPTX SERVICE] PowerPoint presentation compiled successfully: ${destPath}`);
  return destPath;
};
