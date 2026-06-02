import os from 'os';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Subscription from '../models/Subscription.js';
import SystemMetric from '../models/SystemMetric.js';
import { getQueueSizes } from '../queues/queueManager.js';
import AppError from '../utils/appError.js';

/**
 * Administrative APIs for RepoMind AI SaaS telemetry
 */

// 1. Get telemetry summary metrics dashboard
export const getTelemetryDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeSubCheck = await Subscription.find({ status: 'active' });
    
    // Revenue calculations (aggregate active prices)
    const activeSubscriptionsCount = activeSubCheck.length;
    const monthlyRevenueSum = activeSubCheck.reduce((acc, curr) => acc + curr.price, 0);

    // Queue metric sizes
    const queueSizes = await getQueueSizes();

    // CPU/Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsagePercent = parseFloat(((totalMem - freeMem) / totalMem * 100).toFixed(2));
    const cpuCores = os.cpus().length;
    const loadAvg = os.loadavg(); // Returns load average over 1, 5, 15 minutes

    // Project breakdown by status
    const pendingProjs = await Project.countDocuments({ status: 'pending' });
    const analyzingProjs = await Project.countDocuments({ status: 'analyzing' });
    const completedProjs = await Project.countDocuments({ status: 'completed' });
    const failedProjs = await Project.countDocuments({ status: 'failed' });

    res.status(200).json({
      success: true,
      message: 'Administrative Telemetry Dashboard fetched successfully.',
      data: {
        billing: {
          activeSubscriptions: activeSubscriptionsCount,
          monthlyRecurringRevenue: monthlyRevenueSum,
          currency: 'USD'
        },
        users: {
          totalUsers
        },
        projects: {
          total: totalProjects,
          pending: pendingProjs,
          analyzing: analyzingProjs,
          completed: completedProjs,
          failed: failedProjs
        },
        host: {
          cpuCores,
          cpuLoadAverage: loadAvg,
          memoryTotalBytes: totalMem,
          memoryFreeBytes: freeMem,
          memoryUsagePercent
        },
        queues: queueSizes
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Telemetry list of users subscription profiles
export const getUserQuotasList = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email plan credits usage createdAt').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'SaaS user subscription profiles retrieved.',
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// 3. Create System Metric Snapshot and record to database ledger
export const recordSystemMetricsSnapshot = async (req, res, next) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsagePercent = parseFloat(((totalMem - freeMem) / totalMem * 100).toFixed(2));
    const loadAvg = os.loadavg();
    const queueSizes = await getQueueSizes();

    const metric = await SystemMetric.create({
      cpuUsage: loadAvg[0] * 10, // Simulated CPU load scaling from load averages
      memoryUsagePercent,
      memoryFreeBytes: freeMem,
      memoryTotalBytes: totalMem,
      activeConnections: Math.floor(Math.random() * 50) + 5, // Mock socket connections
      averageLatencyMs: Math.floor(Math.random() * 120) + 15, // Mock router latency
      errorRatePercent: parseFloat((Math.random() * 2).toFixed(2)),
      queueMetrics: {
        analysisQueueSize: queueSizes.analysisQueue || 0,
        aiQueueSize: queueSizes.aiQueue || 0,
        docxQueueSize: queueSizes.docxQueue || 0,
        pdfQueueSize: queueSizes.pdfQueue || 0,
        pptQueueSize: queueSizes.pptQueue || 0,
        diagramQueueSize: queueSizes.diagramQueue || 0,
        notificationQueueSize: queueSizes.notificationQueue || 0,
        cleanupQueueSize: queueSizes.cleanupQueue || 0,
        activeWorkers: Math.floor(Math.random() * 4) + 1 // Mock active workers
      }
    });

    res.status(201).json({
      success: true,
      message: 'System telemetry metric snapshot captured and recorded.',
      data: metric
    });
  } catch (err) {
    next(err);
  }
};

// 4. Retrieve system metrics logging ledger history
export const getSystemMetricsHistory = async (req, res, next) => {
  try {
    // Retrieve last 100 recorded snapshots
    const history = await SystemMetric.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json({
      success: true,
      message: 'Telemetry metrics snapshot history fetched.',
      data: history
    });
  } catch (err) {
    next(err);
  }
};
