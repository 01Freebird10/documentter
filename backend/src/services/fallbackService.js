export const generateFallbackContent = (context) => {
  console.log(`[AI FALLBACK] Generating offline content specifications for project: ${context.projectName}`);

  const techList = context.technologies.join(', ');
  const featuresList = context.features.map(f => f.name).join(', ');
  const apiDetails = context.apiMap.map(a => `- ${a.method} ${a.path} (Auth: ${a.authRequired ? 'Required' : 'None'})`).join('\n');
  const dbModels = context.databaseOverview.models.join(', ');
  
  // 1. DRAFT ACADEMIC REPORT SECTIONS
  const reportContent = {
    title: `${context.projectName} — Enterprise Software Engineering Specification`,
    abstract: `This technical specification blueprints ${context.projectName}, a modern ${context.category} codebase. Built leveraging the ${techList} stack, the application enforces modular design protocols and integrates database entities. An audit of code modules reveals a Complexity rating of ${context.complexityScore} and a Maintainability index of ${context.maintainabilityScore}, confirming standard enterprise parameters.`,
    
    introduction: `The modern software engineering landscape demands highly structured, maintainable workspaces. ${context.projectName} acts as a specialized ${context.category} solution. By utilizing ${techList}, the system coordinates structural routers, services, and databases to deliver features such as ${featuresList}. This document serves as a complete technical blueprint of its capabilities.`,
    
    problemStatement: `Legacy architectures frequently suffer from tightly coupled router gates and database queries, which introduces vulnerabilities. Furthermore, static audit indicators reveal: ${context.weaknesses.join(' / ')}. ${context.projectName} addresses these limitations by establishing clean controller separations.`,
    
    objectives: `1. Scrape codebase components cleanly.\n2. Expose structured REST API service portals. Detailed API endpoints include:\n${apiDetails}\n3. Scale relational entities (${dbModels}) dynamically under a Mongoose/Prisma schema setup.`,
    
    techStack: `The core frameworks in use include ${techList}. Express/Node.js provides rapid REST middleware configurations, React supports modular dashboard interfaces, and Mongoose ORM structures NoSQL queries securely.`,
    
    systemArchitecture: `Conforming to Clean Architecture / MVC structures, request payloads traverse security middlewares (CORS, Rate Limiter, Helmet) before hitting the ${context.databaseOverview.dialect || 'Mongoose database'} gateway.`,
    
    modules: `Key sub-cluster modules include:\n- Router gates: Coordinates REST endpoints.\n- Controllers logic: Handles payload schemas validation.\n- Models entities: Connects database tables.`,
    
    implementation: `The application is compiled in ES module configurations. Active codebase features in play: ${featuresList}. Diagnostics indicate strong code organization scores (${context.codeOrganizationScore}/100) and structured code files.`,
    
    databaseDesign: `The system integrates a ${context.databaseOverview.dialect || 'Mongoose schema'} dialect. Main schema models defined: ${dbModels}. Fields enforce data validations, indexes, and primary key relationships.`,
    
    apiDesign: `Exposes ${context.apiMap.length} REST endpoints. The API Map outlines methods, parameters and session protection guards:\n${apiDetails}`,
    
    features: `Parsed functional features include:\n${context.features.map(f => `- ${f.name}: ${f.evidence}`).join('\n')}`,
    
    testing: `Testing coverage parameters: No unit or integration spec files were detected during static scan passes. We recommend installing Jest/Mocha validator suites.`,
    
    advantages: `Strengths audited: ${context.strengths.join(' / ')}. Complexity scores represent secure, modular codes (${context.complexityScore}/100).`,
    
    futureScope: `Recommended refactoring milestones:\n${context.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    
    conclusion: `In conclusion, ${context.projectName} successfully demonstrates standard MVC design principles. It establishes a highly maintainable foundation for subsequent AI scaling passes.`
  };

  // 2. DRAFT PPT SLIDE BLUEPRINTS
  const pptContent = [
    {
      slideNum: '01',
      title: 'Title Slide',
      bullets: [
        `Project: ${context.projectName}`,
        `Category: ${context.category}`,
        `Technology Stack: ${techList}`,
        'AI Generated Technical Showcase'
      ]
    },
    {
      slideNum: '02',
      title: 'Project Overview',
      bullets: [
        `Purpose: ${context.purpose}`,
        `Core Capabilities: ${featuresList}`,
        `System Grade: Complexity (${context.complexityScore}), Maintainability (${context.maintainabilityScore})`
      ]
    },
    {
      slideNum: '03',
      title: 'Problem Statement',
      bullets: [
        `Identified Weaknesses: ${context.weaknesses[0] || 'Tight schema couplings.'}`,
        `Architectural Targets: ${context.weaknesses[1] || 'Missing automated test suites.'}`,
        'Requires clean controller separation layers.'
      ]
    },
    {
      slideNum: '04',
      title: 'Technology Stack',
      bullets: [
        `Backend Framework: Node.js / Express REST gateways`,
        `Frontend Views: React modular panels`,
        `Database: ${context.databaseOverview.dialect}`,
        `Security: JWT Authentication, password encryption`
      ]
    },
    {
      slideNum: '05',
      title: 'System Architecture',
      bullets: [
        'Modular Clean Architecture / MVC parameters',
        'Request travels: Middlewares -> Routers -> Controllers -> Services',
        'Secured via CORS, Helmet, Rate Limiter'
      ]
    },
    {
      slideNum: '06',
      title: 'Database Schema Design',
      bullets: [
        `DB Engine: ${context.databaseOverview.dialect}`,
        `Parsed Schemas: ${dbModels}`,
        'Enforces indexing and relational references constraint keys'
      ]
    },
    {
      slideNum: '07',
      title: 'API Endpoints Map',
      bullets: [
        `Total routes compiled: ${context.apiMap.length}`,
        `Auth restricted endpoints: ${context.apiMap.filter(a => a.authRequired).length} routes`,
        'Enforces secure sessions and token exchanges'
      ]
    },
    {
      slideNum: '08',
      title: 'Project Strengths',
      bullets: context.strengths.slice(0, 3)
    },
    {
      slideNum: '09',
      title: 'Refactoring Blueprint',
      bullets: context.recommendations.slice(0, 3)
    },
    {
      slideNum: '10',
      title: 'Conclusion',
      bullets: [
        `Successful compilation of ${context.projectName}`,
        'Modular, maintainable code configurations',
        'Ready for production deployment'
      ]
    }
  ];

  // 3. DRAFT VIVA Q&AS
  const vivaQuestions = {
    basic: [
      {
        q: `What is the core purpose of ${context.projectName}?`,
        a: `It serves as a ${context.category} application designed to ${context.purpose}.`
      },
      {
        q: 'Which technology stack is utilized in this repository?',
        a: `The application leverages ${techList} frameworks.`
      }
    ],
    intermediate: [
      {
        q: 'Explain the folder organization and modules boundaries.',
        a: 'The project implements standard MVC separations: routes manage endpoints, controllers handle schemas, and models connect databases.'
      },
      {
        q: 'How are database schemas and tables defined in this system?',
        a: `The database integrates a ${context.databaseOverview.dialect} with models like: ${dbModels}.`
      }
    ],
    advanced: [
      {
        q: 'What architectural security measures are in place?',
        a: 'The system protects endpoints using JWT verification in authorization headers, CORS filters, and Helmet response headers.'
      },
      {
        q: 'How does the application handle system error mapping?',
        a: 'It routes exceptions through a centralized Express error middleware, converting Casting and Validation errors into uniform JSON shapes.'
      }
    ],
    scenario: [
      {
        q: 'How would you scale this microservice to handle high traffic queries?',
        a: 'I would implement a Redis cache layer for recurrent fetch operations, containerize files using Docker, and balance traffic across multiple PM2 nodes.'
      },
      {
        q: 'How do you resolve unparameterized database query warnings?',
        a: 'By replacing raw string concatenations with parameter bindings in Mongoose/Prisma to disallow NoSQL injection exploits.'
      }
    ],
    techSpecific: [
      {
        q: `Why did you select the ${context.technologies[0] || 'Node.js'} framework?`,
        a: `It provides single-threaded asynchronous non-blocking event-driven loop operations, supporting rapid connection scaling.`
      }
    ]
  };

  // 4. DRAFT RESUME IMPACTS
  const resumeContent = {
    oneLine: `Engineered a scalable ${context.category} platform using ${techList} frameworks, exposing ${context.apiMap.length} REST endpoints.`,
    twoLine: `Developed a high-performance ${context.category} codebase leveraging ${techList} to process complex entity integrations. Mapped structural MVC separations yielding a Maintainability score of ${context.maintainabilityScore}%.`,
    atsBullets: [
      `Architected a modular backend gateway using Express and ${context.databaseOverview.dialect}, reducing controller response latencies by optimizing DB schema relationships for entities: ${dbModels}.`,
      `Integrated JWT-based protected session routing parameters, securing ${context.apiMap.filter(a => a.authRequired).length} private api endpoints from unauthorized access exploits.`,
      `Engineered robust file ingestion buffers capable of processingZIP files up to 100MB, leveraging sandboxed static parsers.`
    ],
    internshipBullets: [
      `Assisted in scaffolding a standard MVC software product, writing schema entities and controllers pipelines using ${techList}.`,
      `Diagnosed and refactored ${context.weaknesses.length} codebase target warnings, incorporating best-practice error filters.`
    ],
    linkedinSummary: `🚀 Excited to showcase my latest software project: ${context.projectName}! Built leveraging a robust ${techList} stack, this ${context.category} application features a clean MVC structure, ${context.apiMap.length} REST endpoints, and ${context.databaseOverview.dialect} database designs. Analyzed and verified with a Maintainability score of ${context.maintainabilityScore}%! #SoftwareEngineering #WebDev #FullStack #NodeJS`
  };

  // 5. DRAFT DEVELOPER MANUALS
  const documentation = {
    projectDoc: `# ${context.projectName} Specification Manual\n\nCategory: ${context.category}\nDetected Tech: ${techList}\n\nThis manual blue-prints the functional directories and capabilities of the analyzed codebase.`,
    developerDoc: `## Developer Onboarding Guide\n\nWelcome to ${context.projectName}! This repository is organized under a modular Clean Architecture system. Follow this manual to familiarize yourself with the directories.`,
    apiDoc: `## API Gateway Specifications\n\nListed paths map available REST channels:\n\n${apiDetails}`,
    architectureDoc: `## Architecture & Components Blueprint\n\nSystem Dialect: ${context.databaseOverview.dialect}\nParsed Clusters: ${dbModels}\n\nRequest Travel: Client -> Middleware -> Routes -> Controller -> DB.`,
    installation: `## Step-by-Step Installation\n\n1. Clone the project locally.\n2. Configure environmental variables (.env).\n3. Install dependencies:\n   \`\`\`bash\n   npm install\n   \`\`\`\n4. Start dev server:\n   \`\`\`bash\n   npm run dev\n   \`\`\`\n\nDependencies include: ${techList}.`,
    deployment: `## Production Deployment Guide\n\n1. Set NODE_ENV=production in .env.\n2. Build static React components assets.\n3. Containerize using the Docker template.\n4. Host the microservice on cloud platforms (Vercel, AWS).`
  };

  return {
    reportContent,
    pptContent,
    vivaQuestions,
    resumeContent,
    documentation
  };
};
