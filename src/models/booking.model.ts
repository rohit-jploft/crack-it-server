import mongoose, { model, Schema, Document, Model, Types, Date } from "mongoose";

export interface BookingData {
  user: Types.ObjectId;
  jobCategory: Types.ObjectId;
  jobDescription: string;
  date: Date;
  duration: Number;
  expert: Types.ObjectId;
  startTime: Date;
  timeZone: string;
  endTime: Date;
  skills: Types.ObjectId[];
  status: "REQUESTED" | "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED";
}

export interface BookingDocument extends BookingData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const bookingSchema: Schema<BookingData> = new Schema<BookingData>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expert: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    jobDescription: {
      type: String,
    },

    jobCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    startTime: {
      type: Date,
      default: null,
        get: (v:any) => v?.toLocaleTimeString([], { hour12: false }),
        set: (v:any) => new Date(`2023-10-20T${v}.000Z`)
    },
    endTime: {
      type:Date,
      default: null,
      get: (v:any) => v?.toLocaleTimeString([], { hour12: false }),
      set: (v:any) => new Date(`2023-10-20T${v}.000Z`)
    },
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "DECLINED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
    },
    date: {
      type: Date,
    },
    timeZone: String,
    skills: {
      type: [Schema.Types.ObjectId],
      ref:"Category",
      require: true,
    },
    duration: {
      type: Number,
    },
  },
  { timestamps: true }
);


const Booking: Model<BookingDocument> = model<BookingDocument>(
  "Booking",
  bookingSchema
);
bookingSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
      delete ret.__v;
      return ret;
  }
});

export default Booking;
