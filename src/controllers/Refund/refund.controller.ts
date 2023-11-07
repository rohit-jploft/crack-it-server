import { Request, Response } from "express";
import Refund from "../../models/refund.model";
import { Types } from "mongoose";
import Booking from "../../models/booking.model";
import { combineTimestamps, getHoursBefore } from "../../helper/helper";
import BookingPayment from "../../models/bookingPayment.model";
import { createTransaction } from "../Wallet/wallet.controller";
import User from "../../models/user.model";

export const createNewRefundRequest = async (
  bookingId: Types.ObjectId,
  amount: number
) => {
  try {
    const refund = Refund.create({
      booking: bookingId,
      amount: amount,
    });
    return refund;
  } catch (error: any) {
    return error.message;
  }
};

export const getTheRefundPercentage = async (hoursBefore: number) => {
  let penaltyPercentage = 0;
  let expertPercentShare;
  let crackItPercentShare;
  if (hoursBefore >= 4) {
    penaltyPercentage = 50;
    expertPercentShare = 25;
    crackItPercentShare = 25;
  } else {
    penaltyPercentage = 75;
    expertPercentShare = 50;
    crackItPercentShare = 25;
  }

  return {
    penaltyPercentage,
    expertPercentShare,
    crackItPercentShare,
  };
};
// function to get the amount to be refunded to crack it or expert user
// while doing cancellation
export const getRefundAmountFromBooking = async (bookingId: Types.ObjectId) => {
  try {
    const booking: any = await Booking.findById(bookingId);
    const payment: any = await BookingPayment.findOne({ booking: bookingId });
    const combineDate = combineTimestamps(booking.date, booking.startTime);

    const getHourBefore = await getHoursBefore(combineDate);

    const getPercentage = await getTheRefundPercentage(getHourBefore);
    const expertrefundAmount =
      (getPercentage.expertPercentShare * payment.totalAmount) / 100;
    const superAdmin = await User.findOne({ role: "SUPER_ADMIN" });
    const Experttrans = await createTransaction(
      expertrefundAmount,
      "CREDIT",
      booking.expert,
      superAdmin?._id,
      "REFUND"
    );
    return Experttrans;
  } catch (error: any) {
    return error.message;
  }
};
