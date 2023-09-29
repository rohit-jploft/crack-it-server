import { model, Schema, Document, Model, Types } from "mongoose";

export interface TimeZoneData {
  offsetMinutes: number;
  symbol: string;
  name: string;
//   isDeleted:boolean
}

export interface TimeZoneDocument extends TimeZoneData, Document {
  //   Add any additional methods or virtual properties specific to this model
}

const TimeZoneSchema: Schema<TimeZoneData> = new Schema<TimeZoneData>(
  {
    name: {
      type: String,
      require: true,
      index: true,
    },
    symbol:String,
    offsetMinutes:Number,
    // isDeleted: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

const TimeZone: Model<TimeZoneDocument> = model<TimeZoneDocument>(
  "TimeZone",
  TimeZoneSchema
);

export default TimeZone;
