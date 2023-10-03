import { Response, Request } from "express";
import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import bookingSchema from "../../schemas/booking.schema";
import Booking from "../../models/booking.model";
import {
  addMinutesToDate,
  addMinutesToTime,
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
    // console.log(getTimeInDateStamp("12:10:00"), "startTime");
    const checkIfalreadyBooked = await Booking.findOne({
      expert: ObjectId(value.expert),
      date: value.date,
      startTime: value.startTime,
      status: { $in: ["ACCEPTED", "REQUESTED"] },
    });
    console.log(checkIfalreadyBooked);
    if (!checkIfalreadyBooked) {
      const bookingObj = new Booking({
        user: ObjectId(value.user),
        expert: ObjectId(value.expert),
        jobCategory: value.jobCategory,
        jobDescription: value.jobDescription ? value.jobDescription : "",
        startTime: value.startTime,
        date: value.date,
        skills: value.skills ? value.skills : [],
        duration: value.duration,
        timeZone: value.timeZone,
        endTime: addMinutesToTime(value.startTime, value.duration),
      });
      console.log(bookingObj);
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
        type: "error",
        status: 203,
        message: `expert is already Booked at ${value.startTime} on ${value.date}`,
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
const getTimeFromDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes}`;
};
// export const getAllBooking = async (req: Request, res: Response) => {
//   const { userId, status, role, tabStatus } = req.query;
//   const currentPage = Number(req?.query?.page) + 1 || 1;
//   const currentDateTime = new Date();
//   let limit = Number(req?.query?.limit) || 10;

//   const skip = limit * (currentPage - 1);
//   var query = <any>{};
//   if (tabStatus) {
//     if (tabStatus.toString().toUpperCase() === "UPCOMING") {
//       query["$or"] = [
//         { date: { $gte: currentDateTime } }, // Meetings on future days
//         {
//           date: currentDateTime, // Meetings on the current day but future times
//           startTime: { $gte: currentDateTime },
//         },
//       ];
//     }
//     if (tabStatus.toString().toUpperCase() === "PAST") {
//       query["$or"] = [
//         { date: { $lt: currentDateTime } }, // Meetings on previous days
//         {
//           date: currentDateTime, // Meetings on the current day but past times
//           endTime: { $lt: currentDateTime },
//         },
//       ];
//     }
//     if (tabStatus.toString().toUpperCase() === "CANCELLED") {
//       query.status = "CANCELLED";
//     }
//   }
//   if (userId) {
//     query["$or"] = [
//       { user: ObjectId(userId.toString()) },
//       { expert: ObjectId(userId.toString()) },
//     ];
//   }
//   if (status) query.status = { $regex: status.toString(), $options: "i" };

//   try {
//     const bookings = await Booking.find(query)
//       .populate("jobCategory", "title")
//       .populate("expert", "-password")
//       .populate("user", "-password")
//       .populate({
//         path: "skills",
//         select: "title",
//         populate: {
//           path: "parent",
//           select: "title",
//         },
//       })
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });
//     const totalCount = await Booking.countDocuments(query);

//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: bookings,
//       pagination: pagination(totalCount, currentPage, limit),
//       message: "Booking details fetched successfully",
//     });
//   } catch (error: any) {
//     // Return error if anything goes wrong
//     return res.status(403).json({
//       success: false,
//       status: 403,
//       message: error.message,
//     });
//   }
// };
export const getAllBooking = async (req: Request, res: Response) => {
  const { userId, status, role, tabStatus } = req.query;
  const currentPage = Number(req?.query?.page) + 1 || 1;
  const currentDateTime = new Date();
  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  const matchQuery: any = {};
  console.log(userId, status, role, tabStatus);
  if (tabStatus) {
    if (tabStatus.toString().toUpperCase() === "UPCOMING") {
      matchQuery["$or"] = [
        { date: { $gte: currentDateTime }, status: { $ne: "CANCELLED" } }, // Meetings on future days
        {
          date: currentDateTime, // Meetings on the current day but future times
          startTime: { $gte: currentDateTime },
          status: { $ne: "CANCELLED" },
        },
      ];
    }
    if (tabStatus.toString().toUpperCase() === "PAST") {
      matchQuery["$or"] = [
        { date: { $lt: currentDateTime }, status: { $ne: "CANCELLED" } }, // Meetings on previous days
        {
          date: currentDateTime, // Meetings on the current day but past times
          endTime: { $lt: currentDateTime },
          status: { $ne: "CANCELLED" },
        },
      ];
    }
    if (tabStatus.toString().toUpperCase() === "CANCELLED") {
      matchQuery.status = "CANCELLED";
    }
  }

  if (userId) {
    if (tabStatus?.toString().toUpperCase() === "CANCELLED") {
      // matchQuery["$or"] = [
      //   { user: ObjectId(userId.toString()) },
      //   { expert: ObjectId(userId.toString()) },
      // ];
      if (role === "USER") matchQuery.user = userId;
      if (role === "EXPERT") matchQuery.expert = userId;
      matchQuery.status = "CANCELLED";
    } else {
      if (role === "USER") matchQuery.user = ObjectId(userId.toString());
      if (role === "EXPERT") matchQuery.expert = ObjectId(userId.toString());
      matchQuery.status = { $ne: "CANCELLED" };
    }
  }

  if (status) {
    matchQuery.status = { $regex: status.toString(), $options: "i" };
  }
  console.log(matchQuery);
  try {
    const aggregatePipeline: any[] = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "categories", // Change to the actual name of the collection
          localField: "jobCategory",
          foreignField: "_id",
          as: "jobCategory",
        },
      },
      {
        $unwind: {
          path: "$jobCategory",
        },
      },

      {
        $lookup: {
          from: "experts", // Change to the actual name of the collection
          localField: "expert",
          foreignField: "user",
          as: "expertData",
        },
      },
      {
        $unwind: {
          path: "$expertData",
        },
      },
      {
        $lookup: {
          from: "users", // Change to the actual name of the collection
          localField: "expert",
          foreignField: "_id",
          as: "expert",
        },
      },
      {
        $unwind: {
          path: "$expert",
        },
      },
      {
        $lookup: {
          from: "users", // Change to the actual name of the collection
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $lookup: {
          from: "categories", // Change to the actual name of the collection
          localField: "skills",
          foreignField: "_id",
          as: "skills",
        },
      },
      {
        $addFields: {
          skills: {
            $arrayElemAt: ["$skills", 0],
          },
        },
      },
      // {
      //   $unwind: {
      //     path:"$skills"
      //   },
      // },
      {
        $lookup: {
          from: "categories", // Change to the actual name of the collection
          localField: "skills.parent",
          foreignField: "_id",
          as: "skills.parent",
        },
      },
      {
        $unwind: {
          path: "$skills.parent",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    const bookings = await Booking.aggregate([...aggregatePipeline]);
    console.log(bookings.length, "length");
    const totalCount = await Booking.countDocuments(matchQuery);

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

export const getSingleBookingDetail = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  var finalRes;
  try {
    // const booking = await Booking.findById(bookingId)
    //   .populate("expert", "firstName lastName email")
    //   .populate("expert", "firstName lastName email");
    // finalRes.booking = booking;

    const payment: any = await BookingPayment.findOne({
      booking: bookingId,
    }).populate({
      path: "booking",
      populate: {
        path: "expert user",
        select: "-password",
      },
    });
    const expert = await Expert.findOne({
      user: ObjectId(payment?.booking?.expert?._id.toString()),
    }).populate("jobCategory");

    finalRes = {
      booking: payment,
      expertProfile: expert,
    };
    return res.status(200).json({
      success: true,
      status: 200,
      data: finalRes,
      message: "Booking detail fetched successfully",
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
