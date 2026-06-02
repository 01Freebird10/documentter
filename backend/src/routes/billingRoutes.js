import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  initializeCheckoutOrder,
  handlePaymentGatewayWebhook,
  getBillingDashboardDetails,
  downloadInvoiceFile
} from '../controllers/billingController.js';

const router = express.Router();

// Apply auth protection globally to all commercial billing routes
router.use(protect);

/**
 * @swagger
 * /api/billing/checkout:
 *   post:
 *     summary: Initialize a commercial checkout order session
 *     tags: [Billing]
 */
router.post('/checkout', initializeCheckoutOrder);

/**
 * @swagger
 * /api/billing/verify:
 *   post:
 *     summary: Verify payment gateway signature and activate subscription
 *     tags: [Billing]
 */
router.post('/verify', handlePaymentGatewayWebhook);

/**
 * @swagger
 * /api/billing/dashboard:
 *   get:
 *     summary: Retrieve authenticated user billing quotas and invoices dashboard
 *     tags: [Billing]
 */
router.get('/dashboard', getBillingDashboardDetails);

/**
 * @swagger
 * /api/billing/invoice/download/{invoiceNumber}:
 *   get:
 *     summary: Download sequential tax invoice file
 *     tags: [Billing]
 */
router.get('/invoice/download/:invoiceNumber', downloadInvoiceFile);

export default router;
