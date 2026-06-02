import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    citations: [
      {
        file: { type: String, required: true },
        type: { type: String, default: 'code' },
        lines: { type: String, default: '' },
        snippet: { type: String, default: '' }
      }
    ],
    suggestedQuestions: [
      {
        type: String
      }
    ],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
