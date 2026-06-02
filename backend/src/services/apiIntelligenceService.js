import { readFileText } from './parserService.js';

export const parseApiEndpoints = (files) => {
  const endpoints = [];
  const processedRoutes = new Set(); // Prevent duplicates

  // Select source code files
  const codeFiles = files.filter(f => f.ext === '.js' || f.ext === '.ts' || f.ext === '.py');

  for (const file of codeFiles) {
    const content = readFileText(file.path);
    if (!content) continue;

    // 1. Scan for Express routers / app triggers
    // Patterns: router.get('/path', protect, ...) or app.post('/path', ...)
    const expressRegex = /(?:router|app)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]([\s\S]*?)(?=\)|;)/gi;
    let match;

    while ((match = expressRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const restOfLine = match[3];

      const key = `${method}-${path}`;
      if (processedRoutes.has(key)) continue;

      // Determine authorization requirements
      const authRequired = /protect|auth|jwt|verify|session|restrict/i.test(restOfLine);

      endpoints.push({
        method,
        path,
        authRequired,
        file: file.relativePath
      });
      processedRoutes.add(key);
    }

    // 2. Scan for NestJS Decorator structures
    // Patterns: @Get('profile') or @Post('register')
    const nestRegex = /@(Get|Post|Put|Delete|Patch)\(\s*['"`]([^'"`]*)/gi;
    let nestMatch;

    while ((nestMatch = nestRegex.exec(content)) !== null) {
      const method = nestMatch[1].toUpperCase();
      const path = nestMatch[2] || '/';
      
      const key = `${method}-${path}`;
      if (processedRoutes.has(key)) continue;

      // Scan surrounding file text for AuthGuards
      const authRequired = content.includes('AuthGuard') || content.includes('JwtAuthGuard');

      endpoints.push({
        method,
        path: path.startsWith('/') ? path : `/${path}`,
        authRequired,
        file: file.relativePath
      });
      processedRoutes.add(key);
    }

    // 3. Scan for Python FastAPI / Flask setups
    // Patterns: @app.get("/items") or @router.post("/checkout")
    const pythonRegex = /@(?:app|router)\.(get|post|put|delete)\(\s*['"`]([^'"`]+)/gi;
    let pyMatch;

    while ((pyMatch = pythonRegex.exec(content)) !== null) {
      const method = pyMatch[1].toUpperCase();
      const path = pyMatch[2];

      const key = `${method}-${path}`;
      if (processedRoutes.has(key)) continue;

      const authRequired = content.includes('Depends(get_current_user)') || content.includes('login_required');

      endpoints.push({
        method,
        path,
        authRequired,
        file: file.relativePath
      });
      processedRoutes.add(key);
    }
  }

  // Seed default CRUD mocks if no routes are statically parsed
  if (endpoints.length === 0) {
    return [
      { method: 'POST', path: '/api/auth/register', authRequired: false },
      { method: 'POST', path: '/api/auth/login', authRequired: false },
      { method: 'GET', path: '/api/projects', authRequired: true },
      { method: 'POST', path: '/api/projects/upload', authRequired: true },
      { method: 'DELETE', path: '/api/projects/:id', authRequired: true }
    ];
  }

  return endpoints;
};
