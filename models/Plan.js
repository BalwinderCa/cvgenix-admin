import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a plan title'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      default: 0,
    },
    priceType: {
      type: String,
      enum: ['one-time', 'monthly', 'yearly'],
      default: 'one-time',
    },
    credits: {
      type: Number,
      required: [true, 'Please provide number of credits'],
      default: 0,
    },
    creditsDescription: {
      type: String,
      trim: true,
      default: 'Resume + ATS Analysis',
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

