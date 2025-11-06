import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Please provide an answer'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'Pricing', 'Templates', 'ATS', 'Export', 'Account', 'Other'],
      default: 'General',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
FAQSchema.index({ category: 1, isActive: 1 });
FAQSchema.index({ isFeatured: 1, isActive: 1 });
FAQSchema.index({ order: 1 });

// Prevent recompilation during development
const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);

export default FAQ;

