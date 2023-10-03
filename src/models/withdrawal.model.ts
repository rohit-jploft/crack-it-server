import { Schema, model, Document, Types } from 'mongoose';

interface WithdrawalRequestData {
  user: Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface WithdrawalRequestDocument extends WithdrawalRequestData, Document {}

const withdrawalRequestSchema = new Schema<WithdrawalRequestDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the user who made the request
      
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WithdrawalRequest = model<WithdrawalRequestDocument>('WithdrawalRequest', withdrawalRequestSchema);

export default WithdrawalRequest;
