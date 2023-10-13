import { model, Schema, Document, Model, Types } from "mongoose";

interface AgencyData {
  name: string;
  phone: number;
  countryCode: string;
  password: string;
  role?: string;
  email: string;
  termAndConditions: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isAgencyProfileVerified: boolean;
  isDeleted?: boolean;
}

interface AgencyDocument extends AgencyData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const agencySchema: Schema<AgencyDocument> = new Schema<AgencyDocument>(
  {
    name: {
      type: String,
    },
    phone: {
      type: Number,
      trim: true,
      unique: true,
    },
    countryCode: {
      type: String,
    },
    role: {
      type: String,
      enum: ["AGENCY"],
      default: "AGENCY",
    },
    email: {
      type: String,
      trim: true,
      default: "",
      unique: true,
    },
    isAgencyProfileVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    termAndConditions: {
      type: Boolean,
      require: true,
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
