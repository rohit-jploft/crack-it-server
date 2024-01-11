import { model, Schema, Document, Model, Types } from "mongoose";

export interface WalletTransactionData {
  amount: number;
  type: "CREDIT" | "DEBIT";
  paymentMethod: "WALLET" | "CARD";
  paymentObj: Object;
  status: "pending" | "success" | "failed";
  user: Types.ObjectId;
  booking: Types.ObjectId;
  title: string;
  otherUser: Types.ObjectId;
  isDeleted?: boolean;
}

export interface WalletTransactionDocument
  extends WalletTransactionData,
    Document {
  //   Add any additional methods or virtual properties specific to this model
}

const walletTransactionSchema: Schema<WalletTransactionDocument> =
  new Schema<WalletTransactionDocument>(
    {
      amount: {
        type: Number,
      },
      type: {
        type: String,
        enums: ["CREDIT", "DEBIT"],
      },
      booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      otherUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      paymentMethod: {
        type: String,
      },
      paymentObj: {
        type: Object,
      },
      status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "success",
      },
      title: {
        type: String,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );

const WalletTransaction: Model<WalletTransactionDocument> =
  model<WalletTransactionDocument>(
    "WalletTransaction",
    walletTransactionSchema
  );

export default WalletTransaction;
