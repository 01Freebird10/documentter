import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';

// Core imports
import connectDB from './config/db.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import diagramRoutes from './routes/diagramRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import AppError from './utils/appError.js';

// SaaS Core imports
import { dynamicRateLimiter, burstLimiter } from './middleware/rateLimiter.js';
import { startWorkers } from './workers/workerProcessor.js';

// Launch background queue worker process threads
startWorkers();

// Initialize environmental settings
dotenv.config();

// Connect MongoDB Database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// ==========================================
// SECURITY & REQUEST FILTERS MIDDLEWARES
// ==========================================

// 1. Helmet headers
app.use(helmet());

// 2. CORS configurations (Allows Vite frontend connection parameters)
app.use(cors({
  origin: '*', // Allow all origins for mock developer testing (can be restricted in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. JSON body parser limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging (Morgan in development mode)
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// 5. Intelligent Dynamic Rate Limiter (SaaS tier dynamic limits & abuse guards)
app.use('/api', dynamicRateLimiter);

// 5b. Burst protection rate limits applied to heavy operations
app.use('/api/projects/upload', burstLimiter);
app.use('/api/analysis/trigger', burstLimiter);
app.use('/api/workflow/start', burstLimiter);

// 6. SQL/NoSQL Injection Sanitization (checks query keys for Mongo operators)
app.use(mongoSanitize());

// 7. HTTP Parameter Pollution Protection
app.use(hpp());

// ==========================================
// ROUTER & DOCUMENTATION PORTALS
// ==========================================

// Swagger OpenAPI documentation UI Page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount standard business routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/chat', chatRoutes);

// Fallback 404 handler for unknown routes
app.use('*', (req, res, next) => {
  next(new AppError(`Requested path gateway not found: ${req.originalUrl}`, 404));
});

// Centralized error parsing middleware
app.use(errorHandler);

// Listen to port
const server = app.listen(port, () => {
  console.log(`[SERVER] RepoMind AI REST Engine listening on port ${port}`);
  console.log(`[SERVER] OpenAPI documentation loaded at http://localhost:${port}/api-docs`);
});

// Graceful rejection handles
process.on('unhandledRejection', (err) => {
  console.error(`[UNHANDLED REJECTION ERROR] Shutting down: ${err.message}`);
  server.close(() => process.exit(1));
});
