import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please provide a role'],
      enum: ['Admin', 'User', 'Manager'],
      default: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    image: {
      type: String,
      default: '/assets/images/users/user-1.jpg',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation during development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

