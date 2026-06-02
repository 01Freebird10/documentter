import GeneratedDocument from '../models/GeneratedDocument.js';
import Project from '../models/Project.js';
import AppError from '../utils/appError.js';

export const getDocumentsByProject = async (projectId, userId) => {
  // Validate ownership
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new AppError('Requested project was not found.', 404);
  }

  return await GeneratedDocument.find({ projectId });
};

export const getDocumentDetails = async (docId, userId) => {
  const doc = await GeneratedDocument.findById(docId);
  if (!doc) {
    throw new AppError('Requested document record was not found.', 404);
  }

  // Validate owner
  const project = await Project.findOne({ _id: doc.projectId, userId });
  if (!project) {
    throw new AppError('Access denied. You do not own this project resources.', 403);
  }

  return doc;
};

export const deleteDocumentRecord = async (docId, userId) => {
  const doc = await GeneratedDocument.findById(docId);
  if (!doc) {
    throw new AppError('Requested document record was not found.', 404);
  }

  const project = await Project.findOne({ _id: doc.projectId, userId });
  if (!project) {
    throw new AppError('Access denied. You do not own this project resources.', 403);
  }

  await GeneratedDocument.deleteOne({ _id: docId });
  return { id: docId };
};
