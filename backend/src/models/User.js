import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Exclude password from query results by default
    },
    avatar: {
      type: String,
      default: ''
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'team', 'enterprise'],
      default: 'free'
    },
    credits: {
      type: Number,
      default: 3
    },
    usage: {
      projectsThisMonth: { type: Number, default: 0 },
      documentsGenerated: { type: Number, default: 0 },
      tokensUsed: { type: Number, default: 0 },
      storageUsedBytes: { type: Number, default: 0 },
      activeSessions: { type: Number, default: 0 }
    },
    billing: {
      lastBillingCycle: { type: Date, default: Date.now },
      stripeCustomerId: { type: String, default: '' },
      stripeSubscriptionId: { type: String, default: '' }
    },
    refreshTokens: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true // Auto creates createdAt & updatedAt properties
  }
);

// Pre-save password hashing hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password helper method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
