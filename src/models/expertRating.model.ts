import { model, Schema, Document, Model, Types } from "mongoose";

export interface ExpertRatingData {
  rating: number;
  expert: Types.ObjectId;
  ratedBy: Types.ObjectId;
  comment?: string;
}

export interface ExpertRatingDocument extends ExpertRatingData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const ExpertRatingSchema: Schema<ExpertRatingDocument> =
  new Schema<ExpertRatingDocument>(
    {
      rating: {
        type: Number,
        require: true,
      },
      expert: {
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

const ExpertRating: Model<ExpertRatingDocument> = model<ExpertRatingDocument>(
  "ExpertRating",
  ExpertRatingSchema
);

export default ExpertRating;
