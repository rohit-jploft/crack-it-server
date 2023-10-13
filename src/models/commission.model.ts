import { model, Schema, Document, Model, Types } from "mongoose";

export interface CommissionData {
  title: string;
  type:'PERCENT' | "FIXED";
  percent?: number;
  // amount if type is fixed then amount will be fixed
  amount?:number;
  isDeleted?: boolean;
}

export interface CommissionDocument extends CommissionData, Document {
//   Add any additional methods or virtual properties specific to this model
}

const commissionSchema: Schema<CommissionDocument> = new Schema<CommissionDocument>(
  {
    title: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      enums:["PERCENT", "FIXED"],
      require:true
    },
    percent:{
        type:Number
    },
    amount:{
        type:Number
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Commission: Model<CommissionDocument> = model<CommissionDocument>(
  "Commission",
  commissionSchema
);

export default Commission;
