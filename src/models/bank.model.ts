import { model, Schema, Document, Model, Types } from "mongoose";

export interface BankData {
  user: Types.ObjectId;
  type: "BANK" | "UPI";
  bankName: string;
  accountName: string;
  accountNo: number;
  ifscCode: string;
  upiId: string;
  isDeleted: boolean;
}

export interface BankDocument extends BankData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const BankSchema: Schema<BankData> = new Schema<BankData>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    accountName: String,
    accountNo: Number,
    bankName: String,
    ifscCode: String,
    type: {
      type: String,
      enum: ["BANK", "UPI"],
    },
    upiId: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Bank: Model<BankDocument> = model<BankDocument>("Bank", BankSchema);

export default Bank;
