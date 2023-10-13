import { Schema, Document, model, Types } from "mongoose";

// Define the interface for Promo Code document
export interface PromoCodeDocument extends Document {
  code: string;
  discountPercentage: number;
  flatAmount: number;
  type: "PERCENT" | "FLAT";
  expirationDate: Date;
  isActive: boolean;
  isDeleted: boolean;
  // Add other fields as needed
}

// Define the schema for Promo Code
const promoCodeSchema = new Schema<PromoCodeDocument>(
  {
    code: {
      type: String,
      unique: true, // Ensure uniqueness of promo code
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    discountPercentage: {
      type: Number,
    },
    flatAmount: {
      type: Number,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Add other fields as needed
  },
  { timestamps: true }
);

// Create the Promo Code model
const PromoCode = model<PromoCodeDocument>("PromoCode", promoCodeSchema);

export default PromoCode;
