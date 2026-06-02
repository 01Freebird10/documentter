import * as documentService from '../services/documentService.js';
import ApiResponse from '../utils/apiResponse.js';
import Project from '../models/Project.js';
import path from 'path';
import fs from 'fs';

export const listDocuments = async (req, res, next) => {
  try {
    const docs = await documentService.getDocumentsByProject(req.params.projectId, req.user._id);
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    
    return ApiResponse.success(res, 'Project document catalog and AI content retrieved successfully!', {
      documents: docs,
      aiContext: project ? project.aiContext : null
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentDetails(req.params.id, req.user._id);
    const project = await Project.findById(doc.projectId);

    if (!project) {
      return ApiResponse.error(res, 'The project associated with this document was not found.', 404);
    }

    // 1. If download targets the compiled DOCX blueprint, stream the actual file from disk
    if (doc.documentType === 'docx') {
      const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
      const docxPath = path.resolve(`./src/uploads/${formattedName}_blueprint.docx`);

      if (fs.existsSync(docxPath)) {
        return res.download(docxPath, `${project.projectName}_technical_specification_report.docx`);
      }
    }

    // 1.5. If download targets the compiled PPTX blueprint, stream the actual file from disk
    if (doc.documentType === 'pptx') {
      const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
      const pptxPath = path.resolve(`./src/uploads/${formattedName}_blueprint.pptx`);

      if (fs.existsSync(pptxPath)) {
        return res.download(pptxPath, `${project.projectName}_presentation_blueprint.pptx`);
      }
    }

    // 1.6. If download targets the compiled PDF blueprint (or viva/tech reports), stream the actual file from disk
    if (doc.documentType === 'pdf' || doc.documentType === 'viva' || doc.documentType === 'tech') {
      const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
      const pdfPath = path.resolve(`./src/uploads/${formattedName}_blueprint.pdf`);

      if (fs.existsSync(pdfPath)) {
        return res.download(pdfPath, `${project.projectName}_technical_specification_report.pdf`);
      }
    }

    // 2. Failsafe/Fallback mock streams for other template formats (resume, etc.)
    const fileName = `${project.projectName.toLowerCase().replace(/[\s\.]+/g, '-')}_blueprint.${
      doc.documentType === 'viva' || doc.documentType === 'tech' ? 'pdf' : doc.documentType
    }`;
    let contentType = 'application/pdf';

    if (doc.documentType === 'pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (doc.documentType === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    return res.status(200).send(`[RepoMind AI - BINARY STREAM] File: ${fileName}\nFormat: ${doc.documentType.toUpperCase()}\nGenerated: ${doc.generatedAt}`);
  } catch (error) {
    next(error);
  }
};

export const previewDocument = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentDetails(req.params.id, req.user._id);
    const project = await Project.findById(doc.projectId);

    if (!project) {
      return ApiResponse.error(res, 'The project associated with this document was not found.', 404);
    }

    const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
    const pdfPath = path.resolve(`./src/uploads/${formattedName}_blueprint.pdf`);

    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline'); // Interactive PDF in-browser loading
      return fs.createReadStream(pdfPath).pipe(res);
    }

    return ApiResponse.error(res, 'The PDF blueprint file is not available on disk yet.', 404);
  } catch (error) {
    next(error);
  }
};

export const getDocumentThumbnail = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentDetails(req.params.id, req.user._id);
    const project = await Project.findById(doc.projectId);

    if (!project) {
      return ApiResponse.error(res, 'The project associated with this document was not found.', 404);
    }

    const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
    const thumbnailPath = path.resolve(`./src/uploads/${formattedName}_thumbnail.png`);

    if (fs.existsSync(thumbnailPath)) {
      res.setHeader('Content-Type', 'image/png');
      return fs.createReadStream(thumbnailPath).pipe(res);
    }

    return res.status(404).send('Thumbnail not compiled yet.');
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocumentRecord(req.params.id, req.user._id);
    return ApiResponse.success(res, 'Document catalog reference cleared successfully!', result, 200);
  } catch (error) {
    next(error);
  }
};
