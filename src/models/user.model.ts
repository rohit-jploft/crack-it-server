import mongoose, { model, Schema, Document, Model, Types } from "mongoose";
import { Roles } from "../utils/role";

interface UserData {
  firstName: string;
  lastName: string;
  agencyName: string;
  phone: number;
  otp: number;
  countryCode: string;
  password: string;
  agency: Types.ObjectId;
  role?: string;
  profilePhoto?: string;
  timeZone?: string;
  email: string;
  webDeviceToken: string;
  isLoggedInFirstTime:boolean;
  isFirstBookingDone:boolean;
  isNewAccount:boolean;
  showBookingGuide:boolean;
  referBy: Types.ObjectId;
  appDeviceToken: string;
  termAndConditions: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isExpertProfileVerified: boolean;
  isDeleted?: boolean;
}

interface UserDocument extends UserData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const userSchema: Schema<UserDocument> = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    agencyName: {
      type: String,
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    agency: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    otp: {
      type: Number,
    },
    phone: {
      type: Number,
      trim: true,
      unique: true,
    },
    countryCode: {
      type: String,
    },
    isLoggedInFirstTime: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "USER", "ADMIN", "EXPERT", "AGENCY"],
      default: Roles.USER,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    webDeviceToken: {
      type: String,
    },
    appDeviceToken: {
      type: String,
    },
    timeZone: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      default: "",
      unique: true,
    },
    isExpertProfileVerified: {
      type: Boolean,
      default: false,
    },
    isNewAccount:{
      type:Boolean,
      default:true
    },
    isFirstBookingDone:{
      type:Boolean,
      default:false
    },
    showBookingGuide:{
      type:Boolean,
      default:true
    },
    password: {
      type: String,
    },
    referBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

const User: Model<UserDocument> = model<UserDocument>("User", userSchema);

export default User;
