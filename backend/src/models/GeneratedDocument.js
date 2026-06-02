import mongoose from 'mongoose';

const generatedDocumentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    documentType: {
      type: String,
      required: true,
      enum: ['docx', 'pdf', 'pptx', 'viva', 'resume', 'tech'],
      index: true
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide a file storage URL or local path']
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const GeneratedDocument = mongoose.model('GeneratedDocument', generatedDocumentSchema);

export default GeneratedDocument;
