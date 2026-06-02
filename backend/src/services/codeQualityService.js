import { readFileText } from './parserService.js';

export const analyzeCodebaseQuality = (files) => {
  let totalLines = 0;
  let largeFilesCount = 0;
  let testFilesCount = 0;
  let commentsCount = 0;
  let securityWarnings = [];
  let databaseQueries = 0;

  const codeFiles = files.filter(f => f.ext === '.js' || f.ext === '.ts' || f.ext === '.py' || f.ext === '.jsx' || f.ext === '.tsx');

  for (const file of codeFiles) {
    const content = readFileText(file.path);
    if (!content) continue;

    const lines = content.split('\n');
    totalLines += lines.length;

    // Check large files (exceeding 400 lines)
    if (lines.length > 400) {
      largeFilesCount++;
    }

    // Check for test files
    if (file.name.includes('.test.') || file.name.includes('.spec.')) {
      testFilesCount++;
    }

    // Match comments patterns: // or /* ... */ or # (python)
    const comments = (content.match(/\/\/|#|\/\*/g) || []).length;
    commentsCount += comments;

    // Match database triggers
    databaseQueries += (content.match(/\.find\(|\.save\(|\.create\(|SELECT\s+.*?\s+FROM/gi) || []).length;

    // ==========================================
    // SECURITY LOOPHOLE WARNING RULES
    // ==========================================
    
    if (content.includes('eval(')) {
      securityWarnings.push({
        type: 'Security Loophole',
        msg: `Sensitive function "eval()" detected in ${file.relativePath}. Avoid parsing raw runtime strings.`,
        severity: 'High'
      });
    }

    if (content.includes('child_process.exec(') || content.includes('exec(')) {
      // Check if it is not inside our own cloneService!
      if (!file.relativePath.includes('cloneService') && !file.relativePath.includes('parserService')) {
        securityWarnings.push({
          type: 'Security Loophole',
          msg: `Shell execution parameter "exec()" detected in ${file.relativePath}. Secures against command injections.`,
          severity: 'High'
        });
      }
    }

    // Match raw unparameterized SQL concatenation patterns: db.query("SELECT * FROM " + table + " WHERE id = " + id)
    const sqlConcat = /db\.query\(\s*['"`][\s\S]*?['"`]\s*\+\s*\w+/gi.test(content);
    if (sqlConcat) {
      securityWarnings.push({
        type: 'Security Loophole',
        msg: `Potential unparameterized SQL injection target in ${file.relativePath}. Replace raw string concatenations with parameter bindings.`,
        severity: 'Critical'
      });
    }
  }

  // ==========================================
  // GRADING FORMULAS
  // ==========================================

  // Complexity score (lower as file and line count grow massively)
  let complexityScore = Math.max(70, 96 - Math.floor(files.length / 80) - Math.floor(totalLines / 8000));
  
  // Maintainability score (lower on large files, higher on comment densities)
  let maintainabilityScore = Math.max(65, 92 - (largeFilesCount * 4) + Math.min(10, Math.floor(commentsCount / 100)));
  
  // Scalability score (higher if routing and container structures exist)
  const hasDocker = files.some(f => f.name === 'Dockerfile');
  const hasRoutes = files.some(f => f.path.includes('routes') || f.path.includes('controllers'));
  let scalabilityScore = 75 + (hasDocker ? 12 : 0) + (hasRoutes ? 8 : 0);
  if (scalabilityScore > 98) scalabilityScore = 98;

  // Diagnostics lists
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (hasRoutes) {
    strengths.push('Excellent modular separation of endpoints routing and operational services layers.');
  } else {
    weaknesses.push('Monolithic endpoint architecture. Routes and logic reside in entry-point files.');
    recommendations.push('Refactor backend server scripts to separate controller and business layers.');
  }

  if (commentsCount > 50) {
    strengths.push('Clean comment density mapping business flow logic parameters.');
  } else {
    recommendations.push('Add inline annotations to map complex controllers logic.');
  }

  if (testFilesCount > 0) {
    strengths.push('Continuous integration parameters reinforced via custom test files.');
  } else {
    weaknesses.push('Missing test modules. No unit or integration specs folders detected.');
    recommendations.push('Incorporate Jest / Mocha test scripts suites to secure endpoints validations.');
  }

  if (largeFilesCount > 0) {
    weaknesses.push(`Found ${largeFilesCount} monolithic files exceeding 400 lines of code.`);
    recommendations.push('Modularize monolithic controllers into secondary helper folders.');
  }

  if (securityWarnings.length > 0) {
    weaknesses.push(`Identified ${securityWarnings.length} potential security warnings during static code audits.`);
    recommendations.push('Audit shell execution triggers and secure databases parameterized queries.');
  }

  // Defaults
  if (strengths.length === 0) strengths.push('Code structure parses cleanly.');
  if (weaknesses.length === 0) weaknesses.push('Low architectural nesting observed.');
  if (recommendations.length === 0) recommendations.push('Maintain clean standard naming conventions.');

  return {
    scores: {
      complexityScore,
      maintainabilityScore,
      scalabilityScore,
      architectureScore: hasRoutes ? 90 : 70,
      codeOrganizationScore: Math.min(95, 80 + files.length % 15),
      documentationScore: files.some(f => f.name.toLowerCase() === 'readme.md') ? 92 : 45
    },
    warnings: securityWarnings,
    strengths,
    weaknesses,
    recommendations
  };
};
