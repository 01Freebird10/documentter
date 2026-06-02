import mongoose from 'mongoose';

const systemMetricSchema = new mongoose.Schema(
  {
    cpuUsage: {
      type: Number,
      required: true,
      default: 0
    },
    memoryUsagePercent: {
      type: Number,
      required: true,
      default: 0
    },
    memoryFreeBytes: {
      type: Number,
      default: 0
    },
    memoryTotalBytes: {
      type: Number,
      default: 0
    },
    activeConnections: {
      type: Number,
      required: true,
      default: 0
    },
    averageLatencyMs: {
      type: Number,
      required: true,
      default: 0
    },
    errorRatePercent: {
      type: Number,
      required: true,
      default: 0
    },
    queueMetrics: {
      analysisQueueSize: { type: Number, default: 0 },
      aiQueueSize: { type: Number, default: 0 },
      docxQueueSize: { type: Number, default: 0 },
      pdfQueueSize: { type: Number, default: 0 },
      pptQueueSize: { type: Number, default: 0 },
      diagramQueueSize: { type: Number, default: 0 },
      notificationQueueSize: { type: Number, default: 0 },
      cleanupQueueSize: { type: Number, default: 0 },
      activeWorkers: { type: Number, default: 0 }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Add index to speed up retrieval of last 24h of telemetry data
systemMetricSchema.index({ timestamp: -1 });

const SystemMetric = mongoose.model('SystemMetric', systemMetricSchema);

export default SystemMetric;
