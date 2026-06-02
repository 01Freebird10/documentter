import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      index: true
    },
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      enum: ['push', 'pull_request', 'ping', 'repository', 'release'],
      index: true
    },
    payload: {
      type: Object,
      required: true
    },
    processed: {
      type: Boolean,
      default: false,
      index: true
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

export default WebhookEvent;
