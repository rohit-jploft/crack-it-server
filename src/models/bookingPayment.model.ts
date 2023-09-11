import mongoose, {
  model,
  Schema,
  Document,
  Model,
  Types,
  Date,
} from "mongoose";

export interface BookingPaymentData {
  booking: Types.ObjectId;
  totalAmount: number;
  tax: number;
  taxAmount: number;
  grandTotal: Number;
  status: "PAID" | "UNPAID";
}

export interface BookingPaymentDocument extends BookingPaymentData, Document {
  // Add any additional methods or virtual properties specific to this model
}

const bookingPaymentSchema: Schema<BookingPaymentData> =
  new Schema<BookingPaymentData>(
    {
      booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
      totalAmount: {
        type: Number,
      },
      tax: {
        type: Number,
        default: 5,
      },
      taxAmount: {
        type: Number,
      },
      grandTotal: {
        type: Number,
      },
      status: {
        type: String,
        enum: ["PAID", "UNPAID"],
        default: "UNPAID",
      },
    },
    { timestamps: true }
  );
bookingPaymentSchema.pre("save", function (next) {
  let taxAmount = (this.tax * this.totalAmount) / 100;
  this.taxAmount = taxAmount;
  this.grandTotal = taxAmount + this.totalAmount;

  next();
});
const BookingPayment: Model<BookingPaymentDocument> =
  model<BookingPaymentDocument>("BookingPayment", bookingPaymentSchema);

export default BookingPayment;
