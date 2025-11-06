import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    userName: {
      type: String,
      required: [true, 'Please provide a user name'],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, 'Please provide a user email'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please provide a payment method'],
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
    },
    transactionId: {
      type: String,
      required: [true, 'Please provide a transaction ID'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      trim: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    planName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation during development
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;






