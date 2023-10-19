import { model, Schema, Document, Model, Types } from "mongoose";

interface AgencyData {
    agency:Types.ObjectId;
    jobCategory:Types.ObjectId;
    description:string;
    expertise:Types.ObjectId[];
    languages:string[];
    experience:number;
    isDeleted?:boolean
}

export interface AgencyDocument extends AgencyData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const agencySchema: Schema<AgencyDocument> = new Schema<AgencyDocument>(
    {
        
        agency: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        description: {
          type: String,
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

const Agency: Model<AgencyDocument> = model<AgencyDocument>(
  "Agency",
  agencySchema
);

export default Agency;
