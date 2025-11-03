import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a plan name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    duration: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      default: 'monthly',
    },
    templatesEdit: {
      type: Number,
      required: [true, 'Please provide number of templates that can be edited'],
      default: 0,
    },
    atsScore: {
      type: Number,
      required: [true, 'Please provide ATS score limit'],
      default: 0,
    },
    cvDownloads: {
      type: Number,
      default: 0,
    },
    coverLetterDownloads: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    popular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation during development
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

export default Plan;

