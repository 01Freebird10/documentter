import Project from '../models/Project.js';
import ApiResponse from '../utils/apiResponse.js';
import * as diagramService from '../services/diagramService.js';
import fs from 'fs';
import path from 'path';

/**
 * Fetch Mermaid.js code syntaxes and modular insights scorecard
 */
export const getProjectDiagramsAndInsights = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project) {
      return ApiResponse.error(res, 'The project registry was not found.', 404);
    }

    const syntaxes = diagramService.compileMermaidSyntaxes(project);
    const insights = diagramService.compileArchitectureInsights(project);
    
    const diagramTypes = Object.keys(syntaxes);
    const diagrams = diagramTypes.map(type => ({
      type,
      syntax: syntaxes[type],
      fileUrl: `/api/diagrams/svg/${project._id}/${type}`, // Streams vector SVGs dynamically
      previewUrl: `/api/diagrams/svg/${project._id}/${type}`
    }));

    return ApiResponse.success(res, 'UML diagrams and architectural insights scorecard retrieved successfully!', {
      diagrams,
      architectureInsights: insights
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Streams the physical vector SVG from disk, compiling it on-the-fly if needed
 */
export const streamDiagramSvg = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send('Project not found.');
    }

    const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
    const svgPath = path.resolve(`./src/uploads/${formattedName}_diagram_${req.params.type}.svg`);

    // 1. If pre-rendered SVG exists, stream it
    if (fs.existsSync(svgPath)) {
      res.setHeader('Content-Type', 'image/svg+xml');
      return fs.createReadStream(svgPath).pipe(res);
    }

    // 2. On-the-fly Puppeteer compiler fallback
    try {
      const syntaxes = diagramService.compileMermaidSyntaxes(project);
      const targetSyntax = syntaxes[req.params.type];
      
      if (targetSyntax) {
        console.log(`[DIAGRAM COMPILER GATEWAY] Triggering on-the-fly compile for: ${req.params.type}`);
        await diagramService.renderMermaidToSvg(targetSyntax, svgPath);
        
        if (fs.existsSync(svgPath)) {
          res.setHeader('Content-Type', 'image/svg+xml');
          return fs.createReadStream(svgPath).pipe(res);
        }
      }
    } catch (err) {
      console.error(`[ON-THE-FLY DIAGRAM COMPILE FAILED] ${err.stack}`);
    }

    return res.status(404).send('Visual diagram not compiled yet.');
  } catch (error) {
    next(error);
  }
};
