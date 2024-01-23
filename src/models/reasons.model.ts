import { model, Schema, Document, Model, Types } from "mongoose";

export interface ReasonData {
  reason: string;
  isDeleted: boolean;
}

export interface ReasonDocument extends ReasonData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const ReasonSchema: Schema<ReasonDocument> = new Schema<ReasonDocument>(
  {
    reason: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Reason: Model<ReasonDocument> = model<ReasonDocument>(
  "Reason",
  ReasonSchema
);

export default Reason;
