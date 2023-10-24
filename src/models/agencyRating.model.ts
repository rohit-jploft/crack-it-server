import { model, Schema, Document, Model, Types } from "mongoose";

export interface AgencyRatingData {
  rating: number;
  agency: Types.ObjectId;
  ratedBy: Types.ObjectId;
  comment?: string;
}

export interface AgencyRatingDocument extends AgencyRatingData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const AgencyRatingSchema: Schema<AgencyRatingDocument> =
  new Schema<AgencyRatingDocument>(
    {
      rating: {
        type: Number,
        require: true,
      },
      agency: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      ratedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        default: "",
      },
    },
    { timestamps: true }
  );

const AgencyRating: Model<AgencyRatingDocument> = model<AgencyRatingDocument>(
  "AgencyRating",
  AgencyRatingSchema
);

export default AgencyRating;
