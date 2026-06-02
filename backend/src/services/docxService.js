import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType, 
  Header, 
  Footer, 
  PageNumber, 
  ExternalHyperlink
} from 'docx';
import fs from 'fs';
import path from 'path';

// Helper to create styled heading paragraphs
const createHeading = (text, level) => {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 300, after: 120 }
  });
};

// Helper to create standard body paragraphs
const createParagraph = (text) => {
  return new Paragraph({
    text,
    spacing: { after: 100 },
    lineSpacing: { before: 240, line: 276 } // 1.15 line spacing
  });
};

// Compile the actual programmatically styled DOCX file
export const compileDocxReport = async (project, destPath) => {
  const context = project.analysisContext;
  const ai = project.aiContext || {};
  const report = ai.reportContent || {};

  const techList = context.technologies.join(', ');
  const dbModels = context.databaseOverview.models.join(', ');

  // ==========================================
  // 1. DATA TABLES FORMATTERS
  // ==========================================

  // Technology Stack Table
  const techTableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Technology', bold: true })], shading: { fill: 'E4E4E7' } }),
        new TableCell({ children: [new Paragraph({ text: 'Category', bold: true })], shading: { fill: 'E4E4E7' } }),
        new TableCell({ children: [new Paragraph({ text: 'Integration Role', bold: true })], shading: { fill: 'E4E4E7' } })
      ]
    }),
    ...context.technologies.map(tech => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: tech, bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: tech.includes('React') || tech.includes('Next') ? 'Frontend' : 'Backend/Database' })] }),
        new TableCell({ children: [new Paragraph({ text: `Provides active developer patterns for compiling this ${context.category} project.` })] })
      ]
    }))
  ];

  const techTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: techTableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
    }
  });

  // API Map Table
  const apiTableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Method', bold: true })], shading: { fill: 'E4E4E7' } }),
        new TableCell({ children: [new Paragraph({ text: 'Endpoint Path', bold: true })], shading: { fill: 'E4E4E7' } }),
        new TableCell({ children: [new Paragraph({ text: 'Auth Protected', bold: true })], shading: { fill: 'E4E4E7' } })
      ]
    }),
    ...context.apiMap.slice(0, 10).map(api => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: api.method, bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: api.path })] }),
        new TableCell({ children: [new Paragraph({ text: api.authRequired ? 'Yes (JWT Bearer)' : 'No (Public)' })] })
      ]
    }))
  ];

  const apiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: apiTableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
    }
  });

  // Database Models Table
  const dbTableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Model Name', bold: true })], shading: { fill: 'E4E4E7' } }),
        new TableCell({ children: [new Paragraph({ text: 'Entity Relationships', bold: true })], shading: { fill: 'E4E4E7' } })
      ]
    }),
    ...context.databaseOverview.models.map(modelName => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: modelName, bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: `Relational mappings reference other data entities (dialect: ${context.databaseOverview.dialect}).` })] })
      ]
    }))
  ];

  const dbTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: dbTableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
    }
  });

  // ==========================================
  // 2. DOCUMENT STRUCTURE ASSEMBLER
  // ==========================================

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: 'RepoMind AI — Technical Blueprint Document',
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun('Page '),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun(' of '),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] })
                ]
              })
            ]
          })
        },
        children: [
          // ------------------------------------------
          // COVER PAGE
          // ------------------------------------------
          new Paragraph({
            text: project.projectName.toUpperCase(),
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 100 }
          }),
          new Paragraph({
            text: 'OFFICIAL BLUEPRINT SPECIFICATION REPORT',
            alignment: AlignmentType.CENTER,
            spacing: { after: 1500 }
          }),
          new Paragraph({
            text: `Category: ${context.category}`,
            bold: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `Technology Stack: ${techList}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 2000 }
          }),
          new Paragraph({
            text: `Created Date: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: 'University Final Year Project / Technical Blueprint Format',
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000 }
          }),
          
          // Page Break after cover page
          new Paragraph({
            text: '',
            pageBreakBefore: true
          }),

          // ------------------------------------------
          // TABLE OF CONTENTS STUB
          // ------------------------------------------
          createHeading('Table of Contents', HeadingLevel.HEADING_1),
          createParagraph('1. Executive Abstract .......................................................................................... 3'),
          createParagraph('2. Problem Statement & Objectives .................................................................... 4'),
          createParagraph('3. Technical Stack Analysis ................................................................................. 5'),
          createParagraph('4. System Design & Database Schema ................................................................... 6'),
          createParagraph('5. API Specifications Mappings ........................................................................... 7'),
          createParagraph('6. Diagnostic audit findings ................................................................................. 8'),
          
          new Paragraph({ text: '', pageBreakBefore: true }),

          // ------------------------------------------
          // CHAPTERS
          // ------------------------------------------
          createHeading('1. Executive Abstract', HeadingLevel.HEADING_1),
          createParagraph(report.abstract || 'Abstract details pending...'),
          
          createHeading('1.1 Introduction Overview', HeadingLevel.HEADING_2),
          createParagraph(report.introduction || 'Introduction details pending...'),

          createHeading('2. Problem Statement & Objectives', HeadingLevel.HEADING_1),
          createParagraph(report.problemStatement || 'Problem statement pending...'),
          
          createHeading('2.1 Engineering Milestones', HeadingLevel.HEADING_2),
          createParagraph(report.objectives || 'Objectives details pending...'),

          new Paragraph({ text: '', pageBreakBefore: true }),

          createHeading('3. Technical Stack Analysis', HeadingLevel.HEADING_1),
          createParagraph(report.techStack || 'Tech stack details pending...'),
          techTable,

          createHeading('4. System Design & Database Schema', HeadingLevel.HEADING_1),
          createParagraph(report.systemArchitecture || 'System architecture details pending...'),
          
          createHeading('4.1 Model Tables Definitions', HeadingLevel.HEADING_2),
          dbTable,

          new Paragraph({ text: '', pageBreakBefore: true }),

          createHeading('5. API Specifications Mappings', HeadingLevel.HEADING_1),
          createParagraph(report.apiDesign || 'API design details pending...'),
          apiTable,

          createHeading('6. Diagnostic audit findings', HeadingLevel.HEADING_1),
          createHeading('6.1 Operational Strengths', HeadingLevel.HEADING_2),
          ...context.strengths.map(s => createParagraph(`● ${s}`)),

          createHeading('6.2 Architectural Weaknesses', HeadingLevel.HEADING_2),
          ...context.weaknesses.map(w => createParagraph(`● ${w}`)),

          createHeading('6.3 Refactoring Recommendations', HeadingLevel.HEADING_2),
          ...context.recommendations.map(r => createParagraph(`● ${r}`)),
          
          createHeading('7. Conclusion & Scope', HeadingLevel.HEADING_1),
          createParagraph(report.conclusion || 'Conclusion details pending...'),

          // ------------------------------------------
          // CODE BLOCK CONTAINER
          // ------------------------------------------
          createHeading('Appendix: Sample Implementation', HeadingLevel.HEADING_1),
          createParagraph('Below is an illustrative code block compiled from routing controller gateways:'),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `// Express REST API Route Protection Middleware\nimport jwt from 'jsonwebtoken';\n\nexport const protect = async (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (err) {\n    next(err);\n  }\n};`,
                            font: 'Courier New',
                            size: 19 // ~9.5pt
                          })
                        ],
                        shading: { fill: 'F4F4F5' }
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  // Pack and save the compiled document to disk
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(destPath, buffer);
  
  console.log(`[DOCX SERVICE] Microsoft Word Document compiled successfully: ${destPath}`);
  return destPath;
};
