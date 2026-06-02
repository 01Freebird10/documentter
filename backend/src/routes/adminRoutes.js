import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTelemetryDashboard,
  getUserQuotasList,
  recordSystemMetricsSnapshot,
  getSystemMetricsHistory
} from '../controllers/adminController.js';
import { getAdminRevenueAnalytics } from '../controllers/revenueController.js';
import AppError from '../utils/appError.js';

const router = express.Router();

/**
 * Custom Administrator verification middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication credentials not supplied.', 401));
  }

  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@repomind.ai'];
  
  // Allow if user is in explicit admin list or has enterprise tier
  const isAuthorized = adminEmails.includes(req.user.email) || req.user.plan === 'enterprise';
  
  if (!isAuthorized) {
    return next(new AppError('Access denied. Administrator privileges required to access telemetry reports.', 403));
  }

  next();
};

// Apply security barriers to all administrative endpoints
router.use(protect);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Retrieve aggregate SaaS performance telemetry dashboard
 *     tags: [Admin]
 */
router.get('/dashboard', getTelemetryDashboard);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Retrieve aggregate SaaS commercial billing revenue statistics
 *     tags: [Admin]
 */
router.get('/revenue', getAdminRevenueAnalytics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Retrieve list of SaaS user accounts and their resource quotas
 *     tags: [Admin]
 */
router.get('/users', getUserQuotasList);

/**
 * @swagger
 * /api/admin/metrics/snapshot:
 *   post:
 *     summary: Trigger manual recording of server host CPU & memory footprint metrics
 *     tags: [Admin]
 */
router.post('/metrics/snapshot', recordSystemMetricsSnapshot);

/**
 * @swagger
 * /api/admin/metrics/history:
 *   get:
 *     summary: Retrieve recorded history database logs of system metrics snapshots
 *     tags: [Admin]
 */
router.get('/metrics/history', getSystemMetricsHistory);

export default router;
