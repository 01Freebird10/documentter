import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  startGitHubOAuthAuth,
  handleOAuthCallback,
  disconnectGitHubAccount,
  listGitHubRepositories,
  triggerRepositoryManualSync,
  listRepositoryHistoryLogs
} from '../controllers/githubController.js';
import { githubWebhookService } from '../services/githubWebhookService.js';
import AppError from '../utils/appError.js';

const router = express.Router();

// ==========================================
// UN-AUTHENTICATED WEBHOOK RECEIVER PORTAL
// ==========================================

/**
 * @swagger
 * /api/github/webhook:
 *   post:
 *     summary: Receive GitHub Webhook event triggers (HMAC SHA-256 Verified)
 *     tags: [GitHub]
 */
router.post('/webhook', async (req, res, next) => {
  const deliveryId = req.headers['x-github-delivery'];
  const eventType = req.headers['x-github-event'];
  const signatureHeader = req.headers['x-hub-signature-256'];
  
  if (!deliveryId || !eventType) {
    return next(new AppError('Format rejected. GitHub webhook headers missing.', 400));
  }

  try {
    // To calculate HMAC on raw body, we require the stringified request payload
    const rawBody = JSON.stringify(req.body);
    
    const event = await githubWebhookService.handleWebhookPayload(
      deliveryId,
      eventType,
      signatureHeader,
      req.body,
      rawBody
    );

    res.status(200).json({
      success: true,
      message: 'GitHub webhook processed successfully.',
      data: { eventId: event._id, processed: event.processed }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// SECURE USER AUTHENTICATED PORTALS
// ==========================================

// Apply auth protection to all subsequent endpoints
router.use(protect);

/**
 * @swagger
 * /api/github/auth:
 *   get:
 *     summary: Get GitHub OAuth redirection URL
 *     tags: [GitHub]
 */
router.get('/auth', startGitHubOAuthAuth);

/**
 * @swagger
 * /api/github/callback:
 *   get:
 *     summary: Handle GitHub OAuth callback and link account
 *     tags: [GitHub]
 */
router.get('/callback', handleOAuthCallback);
router.post('/callback', handleOAuthCallback);

/**
 * @swagger
 * /api/github/disconnect:
 *   post:
 *     summary: Disconnect linked GitHub profile
 *     tags: [GitHub]
 */
router.post('/disconnect', disconnectGitHubAccount);

/**
 * @swagger
 * /api/github/repos:
 *   get:
 *     summary: Explorer repositories from connected GitHub account
 *     tags: [GitHub]
 */
router.get('/repos', listGitHubRepositories);

/**
 * @swagger
 * /api/github/sync:
 *   post:
 *     summary: Trigger manual repository synchronization and background scanning
 *     tags: [GitHub]
 */
router.post('/sync', triggerRepositoryManualSync);

/**
 * @swagger
 * /api/github/history:
 *   get:
 *     summary: Fetch historical sync logs and parsed version releases
 *     tags: [GitHub]
 */
router.get('/history', listRepositoryHistoryLogs);

export default router;
