import { model, Schema, Document, Model, Types } from "mongoose";

export interface RefundData {
  booking: Types.ObjectId;
  status: "PENING" | "ACCEPTED" | "REFUNDED";
  amount: number;
}

export interface RefundDocument extends RefundData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const refundSchema: Schema<RefundDocument> = new Schema<RefundDocument>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    status: {
      type: String,
      enums: ["PENDING", "ACCEPTED", "REFUNDED"],
      default:"PENING"
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Refund: Model<RefundDocument> = model<RefundDocument>(
  "Refund",
  refundSchema
);

export default Refund;
