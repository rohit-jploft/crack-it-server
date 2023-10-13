import { model, Schema, Document, Model, Types } from "mongoose";

export interface WalletData {
  amount: number;
  user: Types.ObjectId;
  isDeleted?: boolean;
}

export interface WalletDocument extends WalletData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const walletSchema: Schema<WalletDocument> = new Schema<WalletDocument>(
  {
    amount: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Wallet: Model<WalletDocument> = model<WalletDocument>(
  "Wallet",
  walletSchema
);

export default Wallet;
