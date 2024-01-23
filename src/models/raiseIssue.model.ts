import { model, Schema, Document, Model, Types } from "mongoose";

export interface RaiseIssueData {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  ticketNo: string;
  query: string;
  reason: Types.ObjectId;
  attachment: string;
  feedbackByAdmin: string;
  status: "OPEN" | "RESOLVED" | "IN_PROGRESS";
  isDeleted: boolean;
}

export interface RaiseIssueDocument extends RaiseIssueData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const RaiseIssueSchema: Schema<RaiseIssueDocument> =
  new Schema<RaiseIssueDocument>(
    {
      booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
      ticketNo: {
        type: String,
        default:''
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      query: {
        type: String,
      },
      reason: {
        type: Schema.Types.ObjectId,
        ref: "Reason",
      },
      feedbackByAdmin: {
        type: String,
        default:""
      },
      attachment: {
        type: String,
      },
      status: {
        type: String,
        default: "OPEN",
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );

const RaiseIssue: Model<RaiseIssueDocument> = model<RaiseIssueDocument>(
  "RaiseIssue",
  RaiseIssueSchema
);

export default RaiseIssue;
