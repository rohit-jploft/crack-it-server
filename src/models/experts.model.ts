import { model, Schema, Document, Model, Types } from "mongoose";

export interface ExpertsData {
    user:Types.ObjectId;
    agency:Types.ObjectId;
    jobCategory:Types.ObjectId;
    description:string;
    expertise:Types.ObjectId[];
    price:number;
    languages:string[];
    experience:number;
    isDeleted?:boolean
}

export interface ExpertsDocument extends ExpertsData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const expertSchema: Schema<ExpertsDocument> = new Schema<ExpertsDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agency: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    languages: [String],
    jobCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    experience:{
        type:Number,
        require:true,
    },
    expertise: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
  },
  { timestamps: true }
);

const Expert: Model<ExpertsDocument> = model<ExpertsDocument>(
  "Expert",
  expertSchema
);

export default Expert;
