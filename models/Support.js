import mongoose from 'mongoose';

const SupportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'read', 'replied', 'resolved'],
      default: 'new',
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SupportSchema.index({ status: 1, createdAt: -1 });
SupportSchema.index({ email: 1 });

// Prevent recompilation during development
const Support = mongoose.models.Support || mongoose.model('Support', SupportSchema);

export default Support;

