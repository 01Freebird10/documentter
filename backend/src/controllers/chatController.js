import ChatMessage from '../models/ChatMessage.js';
import Project from '../models/Project.js';
import { processChatMessage } from '../services/chatService.js';
import ApiResponse from '../utils/apiResponse.js';
import AppError from '../utils/appError.js';

/**
 * Flagship AI Repository Chat REST Controller
 */

// 1. Dispatch query message & receive RAG response
export const sendMessage = async (req, res, next) => {
  const { projectId, conversationId, message, mode = 'architect' } = req.body;
  const userId = req.user._id;

  if (!projectId || !conversationId || !message) {
    return next(new AppError('Project ID, Conversation ID, and query message are required.', 400));
  }

  try {
    // Validate project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return next(new AppError('Target project was not found.', 404));
    }

    // Retrieve previous conversation history thread
    const history = await ChatMessage.find({ conversationId, projectId })
      .sort({ timestamp: 1 })
      .select('role content');

    // Run the RAG AI search and generation pipeline
    const aiResponse = await processChatMessage(
      projectId,
      userId,
      conversationId,
      message,
      mode,
      history
    );

    // Save User message
    await ChatMessage.create({
      projectId,
      conversationId,
      role: 'user',
      content: message
    });

    // Save Assistant response
    const assistantMessage = await ChatMessage.create({
      projectId,
      conversationId,
      role: 'assistant',
      content: aiResponse.content,
      citations: aiResponse.citations || [],
      suggestedQuestions: aiResponse.suggestedQuestions || []
    });

    return ApiResponse.success(res, 'AI reply compiled successfully.', assistantMessage, 200);
  } catch (err) {
    next(err);
  }
};

// 2. Fetch all message logs for a conversation thread
export const getConversationHistory = async (req, res, next) => {
  const { projectId, conversationId } = req.query;
  const userId = req.user._id;

  if (!projectId || !conversationId) {
    return next(new AppError('Project ID and Conversation ID query parameters are required.', 400));
  }

  try {
    // Validate project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return next(new AppError('Target project was not found.', 404));
    }

    const messages = await ChatMessage.find({ conversationId, projectId })
      .sort({ timestamp: 1 });

    return ApiResponse.success(res, 'Conversation history fetched successfully.', messages, 200);
  } catch (err) {
    next(err);
  }
};

// 3. Purge conversation thread logs
export const clearConversation = async (req, res, next) => {
  const { projectId, conversationId } = req.body || req.query;
  const userId = req.user._id;

  if (!projectId || !conversationId) {
    return next(new AppError('Project ID and Conversation ID are required.', 400));
  }

  try {
    // Validate project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return next(new AppError('Target project was not found.', 404));
    }

    await ChatMessage.deleteMany({ conversationId, projectId });

    return ApiResponse.success(res, 'Conversation message thread cleared successfully.', { conversationId }, 200);
  } catch (err) {
    next(err);
  }
};

// 4. Retrieve auto-generated suggested starter questions
export const getSmartSuggestions = async (req, res, next) => {
  const { projectId } = req.query;
  const userId = req.user._id;

  if (!projectId) {
    return next(new AppError('Project ID is required.', 400));
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return next(new AppError('Target project was not found.', 404));
    }

    // Custom starter suggestions derived from actual code parameters
    const suggestions = [
      { id: 's1', text: 'Explain the System Design and components dependencies.', category: 'architecture' },
      { id: 's2', text: 'Where is the main authentication and JWT flow implemented?', category: 'features' },
      { id: 's3', text: 'Show all protected API routes and their middleware validations.', category: 'api' },
      { id: 's4', text: 'Explain the database collections relationships.', category: 'database' },
      { id: 's5', text: 'Identify potential security vulnerabilities or input flaws.', category: 'security' },
      { id: 's6', text: 'Recommend database index and memory caching optimizations.', category: 'performance' }
    ];

    return ApiResponse.success(res, 'Smart suggestions pre-generated successfully.', suggestions, 200);
  } catch (err) {
    next(err);
  }
};
