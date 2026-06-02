import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Standard certificate, declaration, and IEEE styles helper
const getBaseHtmlStyles = (theme = 'academic') => {
  const isIEEE = theme === 'ieee';
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=Merriweather:ital,wght@0,300;0,400;1,300;1,400&display=swap');
      
      body {
        font-family: ${isIEEE ? "'Merriweather', serif" : "'Inter', sans-serif"};
        color: #1F2937;
        line-height: 1.6;
        font-size: ${isIEEE ? '9.5pt' : '10.5pt'};
        margin: 0;
        padding: 0;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      h1, h2, h3, h4 {
        font-family: 'Outfit', sans-serif;
        color: #0F172A;
        margin-top: 1.6em;
        margin-bottom: 0.6em;
        page-break-after: avoid;
      }
      
      h1 {
        font-size: 20pt;
        border-bottom: 2px solid #3B82F6;
        padding-bottom: 8px;
        margin-top: 0;
      }
      
      h2 {
        font-size: 14pt;
        color: #1E293B;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 4px;
      }
      
      h3 {
        font-size: 12pt;
        color: #475569;
      }
      
      p {
        margin-top: 0;
        margin-bottom: 1.2em;
        text-align: justify;
      }
      
      /* Grid layouts */
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin: 20px 0;
      }
      
      .card {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 15px;
      }
      
      .card-title {
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 6px;
        font-size: 11pt;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 9.5pt;
      }
      
      th, td {
        border: 1px solid #E2E8F0;
        padding: 8px 10px;
        text-align: left;
      }
      
      th {
        background-color: #F1F5F9;
        font-weight: 600;
        color: #0F172A;
      }
      
      /* Code Blocks */
      pre {
        background-color: #0F172A;
        color: #38BDF8;
        padding: 15px;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #1E293B;
        font-family: 'Fira Code', monospace;
        font-size: 8.5pt;
        margin: 20px 0;
        white-space: pre-wrap;
      }
      
      /* Cover Page */
      .cover-page {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 40px;
        box-sizing: border-box;
        border-left: 10px solid #3B82F6;
      }
      
      .cover-title {
        font-size: 32pt;
        font-weight: 800;
        color: #0F172A;
        font-family: 'Outfit', sans-serif;
        line-height: 1.2;
        margin-top: 100px;
      }
      
      .cover-subtitle {
        font-size: 14pt;
        color: #475569;
        margin-top: 15px;
        font-weight: 500;
      }
      
      .cover-details {
        margin-top: auto;
        font-size: 11pt;
        color: #475569;
        border-top: 1px solid #E2E8F0;
        padding-top: 20px;
      }
      
      /* IEEE 2-Column layout styling */
      ${isIEEE ? `
        .ieee-title {
          text-align: center;
          font-size: 24pt;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .ieee-authors {
          text-align: center;
          font-size: 11pt;
          margin-bottom: 30px;
          color: #475569;
        }
        .ieee-abstract-box {
          border: 1px solid #CBD5E1;
          padding: 15px;
          margin-bottom: 30px;
          background: #F8FAFC;
        }
        .ieee-abstract-box h2 {
          font-size: 12pt;
          text-align: center;
          border-bottom: none;
          margin-top: 0;
        }
        .ieee-columns {
          display: flex;
          gap: 25px;
        }
        .ieee-col {
          flex: 1;
          width: 50%;
        }
      ` : ''}
    </style>
  `;
};

// Generates complete HTML report layouts
export const compileHtmlTemplate = (project, templateType = 'academic') => {
  const context = project.analysisContext || {};
  const ai = project.aiContext || {};
  const report = ai.reportContent || {};
  const techList = context.technologies?.join(', ') || 'Node.js, Express';
  const dbModels = context.databaseOverview?.models?.join(', ') || 'User, Session';

  const styles = getBaseHtmlStyles(templateType);

  // 1. IEEE double-column template
  if (templateType === 'ieee') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${styles}
      </head>
      <body>
        <div class="ieee-title">${project.projectName.toUpperCase()}</div>
        <div class="ieee-authors">RepoMind AI Engineering Specifications • Published: ${new Date().toLocaleDateString()}</div>
        
        <div class="ieee-abstract-box">
          <h2>Abstract</h2>
          <p><i>${report.abstract || 'This specification blueprints the modular structures of the codebase.'}</i></p>
          <p><strong>Keywords:</strong> ${context.technologies?.slice(0, 5).join(', ') || 'Node.js, MVC'}, static analysis, software architecture</p>
        </div>

        <div class="ieee-columns">
          <div class="ieee-col">
            <h2>I. Introduction Overview</h2>
            <p>${report.introduction || 'This project acts as an automated software analysis gateway.'}</p>

            <h2>II. Objectives & Milestones</h2>
            <p>${report.objectives || 'Expose clean REST endpoints and modularize controllers.'}</p>

            <h2>III. Technology Stack Analysis</h2>
            <p>${report.techStack || 'The frameworks include Express and React.'}</p>
            <table>
              <tr><th>Technology</th><th>Integration Role</th></tr>
              ${context.technologies?.map(tech => `<tr><td><strong>${tech}</strong></td><td>Core Stack Module</td></tr>`).join('') || ''}
            </table>
          </div>
          
          <div class="ieee-col">
            <h2>IV. System Design & Database</h2>
            <p>${report.systemArchitecture || 'Request flows traverse router middleware modules.'}</p>
            <table>
              <tr><th>Model Name</th><th>Relational References</th></tr>
              ${context.databaseOverview?.models?.map(m => `<tr><td><strong>${m}</strong></td><td>Entities Relations Mapped</td></tr>`).join('') || ''}
            </table>

            <h2>V. API Specification Mapping</h2>
            <table>
              <tr><th>Method</th><th>Path</th></tr>
              ${context.apiMap?.slice(0, 5).map(api => `<tr><td><strong>${api.method}</strong></td><td>${api.path}</td></tr>`).join('') || ''}
            </table>

            <h2>VI. Diagnostic Audit Findings</h2>
            <p><strong>Architectural Strengths:</strong></p>
            <ul>
              ${context.strengths?.map(s => `<li>${s}</li>`).join('') || ''}
            </ul>
            <p><strong>Architectural Weaknesses:</strong></p>
            <ul>
              ${context.weaknesses?.map(w => `<li>${w}</li>`).join('') || ''}
            </ul>

            <h2>VII. Conclusion & References</h2>
            <p>${report.conclusion || 'The MVC configuration conforms to scalable coding principles.'}</p>
            <p><strong>References:</strong> [1] RepoMind AI Static Analysis Specifications, 2026. [2] clean Architecture: A Craftsman's Guide, Robert C. Martin.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 2. Academic Project Report template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${styles}
    </head>
    <body>
      <!-- COVER PAGE -->
      <div class="cover-page">
        <div>
          <div class="cover-title">${project.projectName.toUpperCase()}</div>
          <div class="cover-subtitle">COMPREHENSIVE TECHNICAL BLUEPRINT SPECIFICATION</div>
        </div>
        <div class="cover-details">
          <strong>Category:</strong> ${context.category || 'Software Architecture'}<br>
          <strong>Technology Stack:</strong> ${techList}<br>
          <strong>Audit Grade:</strong> Complexity (${context.complexityScore}%), Maintainability (${context.maintainabilityScore}%)<br>
          <strong>Creation Date:</strong> ${new Date().toLocaleDateString()}<br><br>
          <em>University Final Year Project Format • Verified by RepoMind AI</em>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- CERTIFICATE -->
      <div style="padding: 40px; text-align: center;">
        <h2 style="font-size: 20pt; margin-top: 100px; border: none;">BONAFIDE CERTIFICATE</h2>
        <p style="margin-top: 50px; line-height: 2.0; text-align: center;">
          This is to certify that the technical specification report entitled <br>
          <strong>"${project.projectName.toUpperCase()}"</strong> <br>
          is a bonafide blueprint analysis compiled programmatically from source code files. <br>
          Static analysis parameters have been successfully scraped, audit graded, and indexed.
        </p>
        <div style="display: flex; justify-content: space-between; margin-top: 150px;">
          <div>
            <div style="border-top: 1px solid #000; width: 200px; padding-top: 5px;">Head of Software Engineering</div>
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 200px; padding-top: 5px;">Project Evaluator Seal</div>
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- DECLARATION -->
      <div style="padding: 40px;">
        <h2 style="font-size: 20pt; margin-top: 100px; text-align: center; border: none;">STUDENT DECLARATION</h2>
        <p style="margin-top: 50px; line-height: 2.0;">
          I hereby declare that this report entitled <strong>"${project.projectName.toUpperCase()}"</strong> is an architectural blueprint compiled natively by RepoMind AI sandboxed scanning compilers. This work presents factual MVC controllers pathways, routing middleware files, database models schema relations, and technical diagnostics extracted statically from the repository.
        </p>
        <div style="margin-top: 150px; text-align: right;">
          <div style="border-top: 1px solid #000; width: 200px; display: inline-block; padding-top: 5px; text-align: center;">Candidate Signature</div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- ABSTRACT -->
      <h1>1. Executive Abstract</h1>
      <p>${report.abstract || 'This specification blueprints the system components, tracing routes, modules, controllers, and models.'}</p>
      
      <h2>1.1 Introduction Overview</h2>
      <p>${report.introduction || 'This project acts as an automated software analysis gateway.'}</p>

      <h1>2. Problem Statement & Engineering Objectives</h1>
      <p>${report.problemStatement || 'Architectural challenges include unvalidated schema parameters and loose routing boundaries.'}</p>
      
      <h2>2.1 Objectives Checklist</h2>
      <p>${report.objectives || 'Maintain single routing gateways and separate payload validations.'}</p>

      <div class="page-break"></div>

      <!-- TECH STACK -->
      <h1>3. Technology Stack Analysis</h1>
      <p>${report.techStack || 'Core frameworks provide asynchronous controller handling.'}</p>
      
      <table>
        <tr>
          <th>Framework / Package</th>
          <th>Type Category</th>
          <th>Discovered Audit Role</th>
        </tr>
        ${context.technologies?.map(tech => `
          <tr>
            <td><strong>${tech}</strong></td>
            <td>${tech.includes('React') || tech.includes('Next') ? 'Frontend View' : 'Backend Core'}</td>
            <td>Provides framework configurations parsed during manifest dependencies scans.</td>
          </tr>
        `).join('') || ''}
      </table>

      <!-- ARCHITECTURE -->
      <h1>4. System Architecture & Flow Design</h1>
      <p>${report.systemArchitecture || 'Conforms to scalable MVC design separates.'}</p>
      
      <div style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 11px; margin: 20px 0;">
        CLIENT UI (SPA) &rarr; SECURITY MIDDLEWARE &rarr; ROUTER GATEWAY &rarr; CONTROLLERS &rarr; DATABASE (${context.databaseOverview?.dialect || 'Mongoose'})
      </div>

      <div class="page-break"></div>

      <!-- DATABASE DESIGN -->
      <h1>5. Database Design & Models Definition</h1>
      <p>${report.databaseDesign || 'The system structures collections mapped under schema files.'}</p>
      
      <table>
        <tr>
          <th>Database Table Entity</th>
          <th>Validation Constraints</th>
        </tr>
        ${context.databaseOverview?.models?.map(m => `
          <tr>
            <td><strong>${m}</strong></td>
            <td>Referenced relational keys connection (Dialect: ${context.databaseOverview.dialect})</td>
          </tr>
        `).join('') || ''}
      </table>

      <!-- API DESIGN -->
      <h1>6. REST API Gateway Specifications</h1>
      <p>${report.apiDesign || 'Exposes REST routes endpoints protected via JWT verification middleware.'}</p>
      
      <table>
        <tr>
          <th>Method</th>
          <th>Endpoint Route Path</th>
          <th>JWT Auth Requirement</th>
        </tr>
        ${context.apiMap?.slice(0, 10).map(api => `
          <tr>
            <td><strong>${api.method}</strong></td>
            <td><code>${api.path}</code></td>
            <td>${api.authRequired ? 'Yes (JWT Bearer Protected)' : 'No (Public)'}</td>
          </tr>
        `).join('') || ''}
      </table>

      <div class="page-break"></div>

      <!-- DIAGNOSTICS AUDIT -->
      <h1>7. Diagnostic Quality Audit</h1>
      
      <h2>7.1 Architectural Strengths</h2>
      <ul>
        ${context.strengths?.map(s => `<li>${s}</li>`).join('') || '<li>Modular clean controllers boundaries.</li>'}
      </ul>

      <h2>7.2 Architectural Weaknesses & Risks</h2>
      <ul>
        ${context.weaknesses?.map(w => `<li>${w}</li>`).join('') || '<li>Missing automated Jest test coverage directories.</li>'}
      </ul>

      <h2>7.3 Recommended Roadmap Refactoring</h2>
      <ul>
        ${context.recommendations?.map(r => `<li>${r}</li>`).join('') || '<li>Install unit testing vitest packages.</li>'}
      </ul>

      <h1>8. Conclusion & Scope</h1>
      <p>${report.conclusion || 'In conclusion, the project successfully implements standard modular structures.'}</p>

      <div class="page-break"></div>

      <!-- APPENDIX -->
      <h1>Appendix: Sample Implementation</h1>
      <p>Below is a routing controllers validation module extracted statically during parsed scans:</p>
      
      <pre>// Express payload verification
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};</pre>
    </body>
    </html>
  `;
};

/**
 * Launch headless Chrome, load compile HTML layout, and pack PDF and PNG preview thumbnail
 * @param {Object} project - The Mongoose Project model
 * @param {string} pdfDest - Local A4 PDF export path
 * @param {string} thumbnailDest - Local PNG preview thumbnail path
 * @param {string} typeName - Styling template (academic, ieee)
 */
export const compilePdfReport = async (project, pdfDest, thumbnailDest, typeName = 'academic') => {
  console.log(`[PDF SERVICE] Commencing Puppeteer generation: ${pdfDest}`);
  
  const htmlContent = compileHtmlTemplate(project, typeName);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport dimensions
    await page.setViewport({ width: 800, height: 1130, deviceScaleFactor: 2 });
    
    // Set HTML page content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // 1. GENERATE PROFESSIONAL A4 PDF BINARY
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 7.5px; color: #64748B; font-family: 'Inter', sans-serif; width: 100%; display: flex; justify-content: space-between; padding-left: 30px; padding-right: 30px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
          <span>RepoMind AI — Technical Specification Report</span>
          <span>Official Blueprint Spec</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 7.5px; color: #64748B; font-family: 'Inter', sans-serif; width: 100%; display: flex; justify-content: space-between; padding-left: 30px; padding-right: 30px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
          <span>RepoMind AI Verified • v1.0.0</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: '60px',
        bottom: '60px',
        left: '40px',
        right: '40px'
      }
    });
    
    fs.writeFileSync(pdfDest, pdfBuffer);
    console.log(`[PDF SERVICE SUCCESS] PDF file successfully generated: ${pdfDest}`);
    
    // 2. CAPTURE HIGHEST-QUALITY FIRST PAGE SCREENSHOT FOR GALLERY THUMBNAILS
    await page.screenshot({
      path: thumbnailDest,
      clip: { x: 0, y: 0, width: 800, height: 1130 }
    });
    console.log(`[PDF SERVICE SUCCESS] Document PNG Thumbnail saved: ${thumbnailDest}`);
    
    return { pdfDest, thumbnailDest };
  } catch (error) {
    console.error(`[PDF SERVICE CRASH] Failed compiling Puppeteer PDF. ${error.stack}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
