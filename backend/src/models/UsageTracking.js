import mongoose from 'mongoose';

const usageTrackingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    projectsAnalyzed: {
      type: Number,
      default: 0
    },
    reportsGenerated: {
      type: Number,
      default: 0
    },
    pdfGenerated: {
      type: Number,
      default: 0
    },
    pptGenerated: {
      type: Number,
      default: 0
    },
    aiRequestsCount: {
      type: Number,
      default: 0
    },
    storageUsageBytes: {
      type: Number,
      default: 0
    },
    repositoryChatUsage: {
      type: Number,
      default: 0
    },
    resetDate: {
      type: Date,
      default: () => {
        // Default to next month's reset day
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d;
      }
    }
  },
  {
    timestamps: true
  }
);

const UsageTracking = mongoose.model('UsageTracking', usageTrackingSchema);

export default UsageTracking;
