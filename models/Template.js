import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a template name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Resume', 'Cover Letter', 'CV', 'Portfolio', 'Other'],
      default: 'Resume',
    },
    content: {
      type: String,
      required: [true, 'Please provide template content'],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },
    thumbnail: {
      type: String,
      default: '/assets/images/templates/default.jpg',
    },
    createdBy: {
      type: String,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation during development
const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

export default Template;

