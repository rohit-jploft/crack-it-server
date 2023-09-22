import { Response, Request } from "express";
import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import bookingSchema from "../../schemas/booking.schema";
import Booking from "../../models/booking.model";
import {
  addMinutesToDate,
  getDateInDateStamp,
  getTimeInDateStamp,
} from "../../helper/helper";
import BookingPayment from "../../models/bookingPayment.model";
import Expert, { ExpertsDocument } from "../../models/experts.model";
import Commission, { CommissionDocument } from "../../models/commission.model";
import { pagination } from "../../helper/pagination";
import { createConversation } from "../Chat/chat.controller";

export const createBooking = async (req: Request, res: Response) => {
  const data = req.body;

  const { error, value } = bookingSchema.validate(data);

  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  let totalCommission = 0;
  try {
    // get price of an expert per hour
    const getPriceOfExpertPerHour: ExpertsDocument = await Expert.findOne({
      user: ObjectId(value.expert),
    }).select("price");
    // Save the booking details
    const checkIfalreadyBooked = await Booking.findOne({
      expert: ObjectId(value.expert),
      date: value.date,
      startTime: getTimeInDateStamp(value.startTime),
      status: "ACCEPTED",
    });
    if (!checkIfalreadyBooked) {
      const bookingObj = new Booking({
        user: ObjectId(value.user),
        expert: ObjectId(value.expert),
        jobCategory: value.jobCategory,
        jobDescription: value.jobDescription ? value.jobDescription : "",
        startTime: getTimeInDateStamp(value.startTime),
        date: getDateInDateStamp(value.date),
        skills: value.skills ? value.skills : [],
        duration: value.duration,
        timeZone: value.timeZone,
        endTime: addMinutesToDate(
          getTimeInDateStamp(value.startTime),
          value.duration
        ),
      });
      const getCommission: any = await Commission.findOne({
        type: "FIXED",
        isDeleted: false,
      });

      totalCommission = getCommission?.amount;

      const savedBooking = await bookingObj.save();

      let totalAmount = (value.duration / 60) * getPriceOfExpertPerHour?.price;
      const bookPaymentObj = new BookingPayment({
        booking: savedBooking._id,
        totalAmount,
        CommissionAmount: totalCommission,
        grandTotal: totalAmount + totalCommission,
      });
      await bookPaymentObj.save();
      return res.status(200).json({
        status: 200,
        success: true,
        data: savedBooking,
        message: "Booking created successfully",
      });
    } else {
      return res.status(203).json({
        message: `expert is already at ${value.startTime} on ${value.date}`,
      });
    }
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

type queryData = {
  user?: Types.ObjectId;
  expert?: Types.ObjectId;
  status: { $regex: string; $options: string };
  role: "USER" | "EXPERT";
};
export const getAllBooking = async (req: Request, res: Response) => {
  const { userId, status, role } = req.query;
  const currentPage = Number(req?.query?.page) + 1 || 1;

  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);
  var query = <queryData>{};

  if (userId) {
    if (role === "USER") query.user = ObjectId(userId.toString());
    if (!role) query.user = ObjectId(userId.toString());
    if (role === "EXPERT") query.expert = ObjectId(userId.toString());
  }
  if (status) query.status = { $regex: status.toString(), $options: "i" };

  try {
    const bookings = await Booking.find(query)
      .populate("jobCategory", "title")
      .populate("expert", "-password")
      .populate("user","-password")
      .populate({
        path: "skills",
        select: "title",
        populate: {
          path: "parent",
          select: "title",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await Booking.countDocuments(query);
    return res.status(200).json({
      success: true,
      status: 200,
      data: bookings,
      pagination: pagination(totalCount, currentPage, limit),
      message: "Booking details fetched successfully",
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findOneAndUpdate(
      ObjectId(bookingId),
      { status: "CANCELLED" },
      { new: true }
    );
    return res.status(200).json({
      status: 200,
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const acceptBooking = async (req: Request, res: Response) => {
  let { bookingId } = req.params;
  try {
    // if payment done then
    const booking = await Booking.findByIdAndUpdate(
      ObjectId(bookingId),
      { status: "ACCEPTED" },
      { new: true }
    );
    const bookingpayment = await BookingPayment.findOneAndUpdate(
      { booking: ObjectId(bookingId) },
      { status: "PAID" },
      { new: true }
    );
    if (booking && bookingpayment) {
      await createConversation([booking.expert, booking.user], booking._id);
      return res.status(200).json({
        status: 200,
        success: true,
        data: booking,
        message: "Booking request accepted successfully",
      });
    }
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const getAllBookingPayments = async (req: Request, res: Response) => {
  const { status } = req.query;
  var query: any = {};
  if (status) query.status = status;
  const currentPage = Number(req?.query?.page) + 1 || 1;

  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  try {
    const payments = await BookingPayment.find(query)
      .populate({
        path: "booking",
        populate: {
          path: "user expert",
          select: "firstName lastName",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await BookingPayment.countDocuments(query);
    return res.status(200).json({
      success: true,
      status: 200,
      data: payments,
      pagination: pagination(totalCount, currentPage, limit),
      message: "Payment detail fetched successfully",
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
