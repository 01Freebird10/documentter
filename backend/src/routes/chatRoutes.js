import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversationHistory,
  clearConversation,
  getSmartSuggestions
} from '../controllers/chatController.js';

const router = express.Router();

// Apply auth protection universally to all subsequent endpoints
router.use(protect);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send user query to RAG AI platform and receive Senior Architect reply
 *     tags: [AI Chat]
 */
router.post('/message', sendMessage);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Retrieve message history logs for a conversation thread
 *     tags: [AI Chat]
 */
router.get('/history', getConversationHistory);

/**
 * @swagger
 * /api/chat/clear:
 *   post:
 *     summary: Clear/Purge conversation history logs thread
 *     tags: [AI Chat]
 */
router.post('/clear', clearConversation);

/**
 * @swagger
 * /api/chat/suggestions:
 *   get:
 *     summary: Retrieve dynamic dynamic suggested starter queries per repo
 *     tags: [AI Chat]
 */
router.get('/suggestions', getSmartSuggestions);

export default router;
