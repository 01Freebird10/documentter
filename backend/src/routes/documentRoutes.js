import express from 'express';
import * as documentController from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply session protection globally to all document routes
router.use(protect);

/**
 * @swagger
 * /api/documents/{projectId}:
 *   get:
 *     summary: List generated documents catalog references associated with project
 *     description: Returns links to DOCX technical manuals, slide decks, and viva defense guides.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalog list fetched successfully
 *       404:
 *         description: Project or documents reference not found
 */
router.get('/:projectId', documentController.listDocuments);

/**
 * @swagger
 * /api/documents/download/{id}:
 *   get:
 *     summary: Stream or download a generated document file
 *     description: Returns simulated binary contents. Sets appropriate content headers to trigger browser saving windows.
 *     tags: [Documents]
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
 *         description: File successfully streamed as download attachment
 *       404:
 *         description: Document identifier not found
 */
router.get('/download/:id', documentController.downloadDocument);
router.get('/preview/:id', documentController.previewDocument);
router.get('/thumbnail/:id', documentController.getDocumentThumbnail);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete specific document registry references
 *     description: Clears document index references from database tables.
 *     tags: [Documents]
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
 *         description: Catalog record cleared successfully
 *       404:
 *         description: Document identifier not found
 */
router.delete('/:id', documentController.deleteDocument);

export default router;
