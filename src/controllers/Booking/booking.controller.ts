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
  try {
    // get price of an expert per hour
    const getPriceOfExpertPerHour: ExpertsDocument = await Expert.findOne({
      user: ObjectId(value.expert),
    }).select("price");
    // Save the booking details
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
    const savedBooking = await bookingObj.save();
    let totalAmount = (value.duration / 60) * getPriceOfExpertPerHour?.price;
    const bookPaymentObj = new BookingPayment({
      booking: savedBooking._id,
      totalAmount,
    });
    await bookPaymentObj.save();
    return res.status(200).json({
      status: 200,
      success: true,
      data: savedBooking,
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

type queryData = {
  user?: Types.ObjectId;
  expert?: Types.ObjectId;
  status: { $regex: string; $options: string };
  role: "USER" | "EXPERT";
};
export const getAllBooking = async (req: Request, res: Response) => {
  const { userId, status, role } = req.query;

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
      .populate("expert")
      .populate("user")
      .populate({
        path: "skills",
        select: "title",
        populate: {
          path: "parent",
          select: "title",
        },
      });

    return res.status(200).json({
      success: true,
      status: 200,
      data: bookings,
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
