import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      index: true
    },
    plan: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'team', 'enterprise']
    },
    amount: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      default: 0 // Tax like 18% GST for India, or VAT
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      lowercase: true
    },
    billingInterval: {
      type: String,
      enum: ['month', 'year', 'one-time'],
      default: 'month'
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      companyName: { type: String, default: '' },
      billingAddress: { type: String, default: '' },
      gstIn: { type: String, default: '' } // Optional GST Ready Fields
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    fileUrl: {
      type: String,
      default: '' // Path to download the compiled invoice
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate sequential invoice numbers if not supplied: e.g. INV-2026-0001
invoiceSchema.pre('validate', async function (next) {
  if (this.invoiceNumber) return next();
  
  try {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.invoiceNumber = `INV-${year}-${sequence}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
