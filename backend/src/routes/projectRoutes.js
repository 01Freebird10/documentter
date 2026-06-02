import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadZip from '../middleware/uploadMiddleware.js';
import { validateGithubProject, validateZipProject } from '../validators/projectValidator.js';

const router = express.Router();

// Apply session protection globally to all project routes
router.use(protect);

/**
 * @swagger
 * /api/projects/upload:
 *   post:
 *     summary: Ingest and analyze a local ZIP codebase archive
 *     description: Accepts a single zipped repository folder (max 100MB) via multipart/form-data.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - zipFile
 *             properties:
 *               zipFile:
 *                 type: string
 *                 format: binary
 *                 description: Zipped workspace folder to upload
 *               projectName:
 *                 type: string
 *                 description: Override label for project designation
 *     responses:
 *       201:
 *         description: Codebase zipped folder compiled successfully
 *       400:
 *         description: Format rejected or size exceeded 100MB
 */
router.post('/upload', uploadZip.single('zipFile'), validateZipProject, projectController.uploadProjectFile);

/**
 * @swagger
 * /api/projects/github:
 *   post:
 *     summary: Ingest and clone a public GitHub repository link
 *     description: Clones public repository paths for immediate analysis.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - githubUrl
 *               - projectName
 *             properties:
 *               githubUrl:
 *                 type: string
 *                 example: https://github.com/expressjs/express
 *               projectName:
 *                 type: string
 *                 example: express-core-forked
 *     responses:
 *       201:
 *         description: GitHub cloned repository analyzed successfully
 *       400:
 *         description: Invalid GitHub URL schema
 */
router.post('/github', validateGithubProject, projectController.analyzeGithubProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Retrieve active user's projects list
 *     description: Lists all repositories previously parsed by the authenticated user.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 */
router.get('/', projectController.listProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Fetch specific project blueprints specifications
 *     description: Retrieves detailed file stack parameters using project identifier keys.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details successfully retrieved
 *       404:
 *         description: Project identifier not found
 */
router.get('/:id', projectController.getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Purge project workspaces and local zipped records
 *     description: Deletes references from registries, and purges matching file items from disk.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project and associated files purged successfully
 *       404:
 *         description: Project identifier not found
 */
router.delete('/:id', projectController.deleteProject);

export default router;
