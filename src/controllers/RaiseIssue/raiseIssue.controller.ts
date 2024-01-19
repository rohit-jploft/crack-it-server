import { Request, Response } from "express";
import Refund from "../../models/refund.model";
import { Types } from "mongoose";
import Booking from "../../models/booking.model";
import { combineTimestamps, generateRandomNumber, getHoursBefore } from "../../helper/helper";
import BookingPayment from "../../models/bookingPayment.model";
import { createTransaction } from "../Wallet/wallet.controller";
import User from "../../models/user.model";
import RefundRequest from "../../models/raiseIssue.model";
import { pagination } from "../../helper/pagination";
import raiseTicketSchema from "../../schemas/ticket.schema";
import RaiseIssue from "../../models/raiseIssue.model";
import { ObjectId } from "../../helper/RequestHelper";

export const createIssueTicket = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    if (req?.files) {
      var { doc }: any = req?.files;
      if (!doc) {
        return res.status(200).json({
          success: false,
          status: 206,
          message: "Profile pic is required",
        });
      }
      var media = doc[0]?.path?.replaceAll("\\", "/") || "";
    }
    const { error, value } = raiseTicketSchema.validate(data);

    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }
    const checkBooking: any = await Booking.findById(
      ObjectId(value.booking.toString())
    );

    if (checkBooking && checkBooking.status !== "CANCELLED") {
      return res.status(200).json({
        type: "success",
        success: false,
        message: "you can only raise ticket for cancelled booking",
      });
    }

    const newTicket = new RaiseIssue({
      booking: value.booking,
      user: value.user,
      reason: value.reason,
      ticketNo:generateRandomNumber(),
      query: value.query,
      attachment: media ? media : "",
    });

    await newTicket.save();

    return res.status(200).json({
      status: 200,
      type: "success",
      success: true,
      data: newTicket,
    });
  } catch (error: any) {
    return res.status(200).json({
      type: "error",
      success: false,
      message: error.message,
    });
  }
};

export const getAllTickets = async (req: Request, res: Response) => {
  const currentPage = Number(req?.query?.page) + 1 || 1;
  let limit = Number(req?.query?.limit) || 10;
  const skip = limit * (currentPage - 1);

  const { user } = req.query;

  let query: any = { isDeleted: false };

  if (user) query.user = ObjectId(user.toString());
  console.log(query, "query")
  try {
    const getData = await RaiseIssue.aggregate([
      { $match: query  },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "bookingpayments",
          localField: "booking",
          foreignField: "booking",
          as: "payment",
        },
      },
      { $unwind: {
        path:"$payment",
        preserveNullAndEmptyArrays:true
      } },
    ]);

    const totalCount = await RaiseIssue.countDocuments();
    return res.status(200).json({
      status: 200,
      success: true,
      data: getData,
      pagination: pagination(totalCount, currentPage, limit),
      message: "tickets fetched successfully",
    });
  } catch (error: any) {
    return res.status(200).json({
      type: "error",
      success: false,
      message: error.message,
    });
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
    // const combineDate = combineTimestamps(booking.date, booking.startTime);

    const getHourBefore = await getHoursBefore(booking.startTime);

    const getPercentage = await getTheRefundPercentage(getHourBefore);
    const expertrefundAmount =
      (getPercentage.expertPercentShare * payment.totalAmount) / 100;
    const userRefundAmount =
      ((100 - getPercentage.penaltyPercentage) * payment.totalAmount) / 100;
    const superAdmin = await User.findOne({ role: "SUPER_ADMIN" });
    console.log(superAdmin, "superadmin");
    console.log(booking, "booking");

    const Experttrans = await createTransaction(
      expertrefundAmount,
      "CREDIT",
      booking.expert,
      superAdmin?._id,
      "REFUND",
      booking._id
    );
    const userTrans = await createTransaction(
      userRefundAmount,
      "CREDIT",
      booking.user,
      superAdmin?._id,
      "REFUND",
      booking._id
    );

    return { Experttrans, userTrans };
  } catch (error: any) {
    return error.message;
  }
};
