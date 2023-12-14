import { Response, Request } from "express";
import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";

import bookingSchema from "../../schemas/booking.schema";
import Booking from "../../models/booking.model";
import {
  addMinutesToDate,
  addMinutesToTime,
  getDateInDateStamp,
  getTheFinalStartTimeConvertedInDesiredTimeZone,
  getTheTimeZoneConvertedTime,
  getTimeInDateStamp,
} from "../../helper/helper";
import BookingPayment, {
  BookingPaymentDocument,
} from "../../models/bookingPayment.model";
import Expert, { ExpertsDocument } from "../../models/experts.model";
import Commission, { CommissionDocument } from "../../models/commission.model";
import { pagination } from "../../helper/pagination";
import { createConversation } from "../Chat/chat.controller";
import Chat from "../../models/chat.model";
import { Roles } from "../../utils/role";
import { createNotification } from "../Notifications/Notification.controller";
import { NoticationMessage } from "../../utils/notificationMessageConstant";
import { NotificationType } from "../../utils/NotificationType";
import { sendNotification } from "../../helper/notifications";
import { createTransaction } from "../Wallet/wallet.controller";
import { getSuperAdminId } from "../../helper/impFunctions";
import {
  createNewRefundRequest,
  getRefundAmountFromBooking,
} from "../Refund/refund.controller";
import Wallet from "../../models/wallet.model";
import { getAgencyOfAnyExpert } from "../../helper/bookingHelper";
import Category from "../../models/category.model";

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
  // console.log(value, "vz")
  let totalCommission = 0;
  try {
    // get price of an expert per hour
    const getPriceOfExpertPerHour: ExpertsDocument = await Expert.findOne({
      user: ObjectId(value.expert),
    }).select("price");
    // Save the booking details
    // console.log(getTimeInDateStamp("12:10:00"), "startTime");
    const finalDate = getTheTimeZoneConvertedTime(
      value.date,
      value.timeZone,
      true
    );

    const checkIfalreadyBooked = await Booking.findOne({
      expert: ObjectId(value.expert),
      date: getTheFinalStartTimeConvertedInDesiredTimeZone(
        finalDate,
        value.startTime,
        value.timeZone
      ),
      startTime: getTheFinalStartTimeConvertedInDesiredTimeZone(
        finalDate,
        value.startTime,
        value.timeZone
      ),
      status: { $in: ["ACCEPTED", "REQUESTED"] },
    });
    const finalEndTime = addMinutesToTime(value.startTime, value.duration);
    if (!checkIfalreadyBooked) {
      const bookingObj = new Booking({
        user: ObjectId(value.user),
        expert: ObjectId(value.expert),
        jobCategory: value.jobCategory,
        jobDescription: value.jobDescription ? value.jobDescription : "",
        startTime: getTheFinalStartTimeConvertedInDesiredTimeZone(
          finalDate,
          value.startTime,
          value.timeZone
        ),
        date: getTheFinalStartTimeConvertedInDesiredTimeZone(
          finalDate,
          value.startTime,
          value.timeZone
        ),
        skills: value.skills ? value.skills : [],
        duration: value.duration,
        timeZone: value.timeZone,
        endTime: getTheFinalStartTimeConvertedInDesiredTimeZone(
          finalDate,
          finalEndTime,
          value.timeZone
        ),
      });
      // console.log(value.startTime);
      const getCommission: any = await Commission.findOne({
        type: "FIXED",
        isDeleted: false,
      });

      totalCommission = getCommission?.amount;

      const savedBooking = await bookingObj.save();
      await createNotification(
        ObjectId(value.user),
        ObjectId(value.expert),
        NoticationMessage.BookingRequest.title,
        NotificationType.Booking,
        "web",
        NoticationMessage.BookingRequest.message,
        { targetId: savedBooking._id }
      );
      const agency = await getAgencyOfAnyExpert(ObjectId(value.expert));
      if (agency && agency?.isAssociatedWithAgency && agency !== null) {
        await createNotification(
          ObjectId(value.user),
          ObjectId(agency.agencyId),
          NoticationMessage.BookingRequest.title,
          NotificationType.Booking,
          "web",
          NoticationMessage.BookingRequest.message,
          { targetId: savedBooking._id }
        );
      }

      let totalAmount = (value.duration / 60) * getPriceOfExpertPerHour?.price;
      const bookPaymentObj = new BookingPayment({
        booking: savedBooking._id,
        totalAmount,
        CommissionAmount: totalCommission,
        grandTotal: totalAmount + totalCommission,
      });
  
      const savedPayment = await bookPaymentObj.save();
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
  role: Roles.USER | Roles.EXPERT;
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
  // console.log(userId, status, role, tabStatus);
  if (!status) {
    matchQuery.status;
  }

  if (tabStatus) {
    if (
      tabStatus.toString().toUpperCase() === "REQUESTED" ||
      tabStatus.toString().toUpperCase() === "NEW"
    ) {
      matchQuery.status = { $in: ["REQUESTED", "ACCEPTED"] };
    }

    if (tabStatus.toString().toUpperCase() === "UPCOMING") {
      matchQuery["$or"] = [
        { status: "CONFIRMED" }, // Meetings on future days
        // {
        //   date: currentDateTime, // Meetings on the current day but future times
        //   startTime: { $gte: currentDateTime },
        //   status: "CONFIRMED",
        // },
      ];
    }

    if (tabStatus.toString().toUpperCase() === "PAST") {
      matchQuery["$or"] = [
        { status: { $in: ["DECLINED", "CANCELLED", "COMPLETED"] } }, // Meetings on previous days
        // {
        //   date: currentDateTime, // Meetings on the current day but past times
        //   endTime: { $lt: currentDateTime },
        //   status: "COMPLETED",
        // },
      ];
    }
  }

  if (userId) {
    // if (tabStatus?.toString().toUpperCase() === "CANCELLED") {
    // matchQuery["$or"] = [
    //   { user: ObjectId(userId.toString()) },
    //   { expert: ObjectId(userId.toString()) },
    // ];
    if (role === Roles.USER) matchQuery.user = ObjectId(userId.toString());
    if (role === Roles.EXPERT) matchQuery.expert = ObjectId(userId.toString());
    // if (role === "AGENCY") matchQuery.expert = ObjectId(userId.toString());
    //   matchQuery.status = "CANCELLED";
    // } else {
    //   if (role === "USER") matchQuery.user = ObjectId(userId.toString());
    //   if (role === "EXPERT") matchQuery.expert = ObjectId(userId.toString());
    // }
  }

  if (status) {
    matchQuery.status = { $regex: status.toString(), $options: "i" };
  }
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
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "experts", // Change to the actual name of the collection
          localField: "expert",
          foreignField: "user",
          as: "expertData",
          // pipeline:[{

          // }]
        },
      },
      {
        $unwind: {
          path: "$expertData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "expertData.expertise",
          foreignField: "_id",
          as: "expertise",
        },
      },
      {
        $lookup: {
          from: "users", // Change to the actual name of the collection
          localField: "expert",
          foreignField: "_id",
          as: "expert",
          // pipeline:[{$project:{otp:-1}}]
        },
      },
      {
        $unwind: {
          path: "$expert",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bookingpayments", // Change to the actual name of the collection
          localField: "_id",
          foreignField: "booking",
          as: "PaymentData",
        },
      },
      {
        $unwind: {
          path: "$PaymentData",
          preserveNullAndEmptyArrays: true,
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories", // Change to the actual name of the collection
          localField: "skills",
          foreignField: "_id",
          as: "skillData",
        },
      },

      // {
      //   $addFields: {
      //     skills: {
      //       $arrayElemAt: ["$skills", 0],
      //     },
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$skills",
      //     preserveNullAndEmptyArrays: true,
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
        $sort: { startTime: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
     
    ];

    const bookings = await Booking.aggregate([...aggregatePipeline]);

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
export const refundAmountForMeeting = async (meetingId: Types.ObjectId) => {
  const superAdminId = await getSuperAdminId();
  try {
    const booking: any = await BookingPayment.findOne({ booking: meetingId });
    if (booking?.status === "PAID") {
      await createTransaction(
        booking.totalAmount,
        "CREDIT",
        booking?.user,
        superAdminId,
        "refund"
      );
    }
  } catch (error: any) {
    return error.message;
  }
};

export const ifCancelByExpertThanFirstChargeThanRefund = async (
  res: Response,
  bookingId: Types.ObjectId
) => {
  try {
    const superAdminId = await getSuperAdminId();
    const booking: any = await Booking.findById(bookingId);
    const bookingPayment: any = await BookingPayment.findOne({booking:ObjectId(bookingId.toString())});
    const ExpertWallet: any = await Wallet.findOne({ user: booking.expert });

    if (ExpertWallet.amount < 25) {
      return {
        isLow: false,
      };
    } else {
      var trans = await createTransaction(
        25,
        "DEBIT",
        booking.expert,
        superAdminId,
        "Cancellation charge"
      );
      var userTrans = await createTransaction(
        bookingPayment.totalAmount,
        "CREDIT",
        booking.user,
        superAdminId,
        "Cancellation return"
      );
      return {trans, userTrans, isLow:true};
    }
  } catch (error: any) {
    return error.message;
  }
};
export const cancelBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { role } = req.query;
  const superAdminId = await getSuperAdminId();
  try {
    const booking: any = await Booking.findById(ObjectId(bookingId));

    if (role === "USER" && booking.status === "CONFIRMED") {

      const ref = await getRefundAmountFromBooking(booking._id);
      console.log(ref, "ref")
    }
    if (role === "EXPERT" && booking.status === "CONFIRMED") {
      const check: any = await ifCancelByExpertThanFirstChargeThanRefund(
        res,
        ObjectId(bookingId)
      );
      if (check && !check?.isLow) {
        return res.status(201).json({
          status: 201,
          success: false,
          message: "you need to have $25 to cancel the meeting",
        });
      }
    }
    if (role === "EXPERT" && booking.status === "CONFIRMED") {
      // + 50 is for store creedit
     const trans = await createTransaction(
        booking.totalAmount + 50,
        "CREDIT",
        booking.user,
        superAdminId,
        "Refund for cancellation by expert"
      );
      console.log(trans, "trans")
    }
    
    // await createNewRefundRequest(ObjectId(bookingId),50 );
    booking.status = "CANCELLED";
    await createNotification(
      ObjectId(booking.user),
      ObjectId(booking.expert),
      NoticationMessage.CancelBooking.title,
      NotificationType.Booking,
      "web",
      NoticationMessage.CancelBooking.message,
      { targetId: booking._id }
    );
    await booking.save();
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Booking cancelled successfully",
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
    const booking: any = await Booking.findById(ObjectId(bookingId));
    if (booking?.status === "ACCEPTED") {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Booking request is already accepted",
      });
    }
    booking.status = "ACCEPTED";
    await booking?.save();
    await createNotification(
      ObjectId(booking.expert),
      ObjectId(booking.user),
      NoticationMessage.BookingAccept.title,
      NotificationType.Booking,
      "web",
      NoticationMessage.BookingAccept.message,
      { targetId: booking._id }
    );

    if (booking) {
      // const chat = await Chat.findOne({ booking: ObjectId(bookingId) });
      // console.log(chat);
      // if (!chat) {
      //   await createConversation(
      //     [booking?.expert, booking?.user],
      //     ObjectId(bookingId)
      //   );
      // }
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
export const declinedBooking = async (req: Request, res: Response) => {
  let { bookingId } = req.params;
  try {
    // if payment done then
    const booking: any = await Booking.findById(ObjectId(bookingId));
    if (booking?.status === "DECLINED") {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Booking request is already declined",
      });
    }
    booking.status = "DECLINED";
    await booking?.save();

    if (booking) {
      // const chat = await Chat.findOne({ booking: ObjectId(bookingId) });
      // console.log(chat);
      // if (!chat) {
      //   await createConversation(
      //     [booking?.expert, booking?.user],
      //     ObjectId(bookingId)
      //   );
      // }
      return res.status(200).json({
        status: 200,
        success: true,
        data: booking,
        message: "Booking request declined successfully",
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
    })
      .populate("promoCode")
      .populate({
        path: "booking",
        populate: {
          path: "expert user jobCategory skills",
         
          select: "-password",
        },
      });
    const expert = await Expert.findOne({
      user: ObjectId(payment?.booking?.expert?._id.toString()),
    }).populate("jobCategory");
    const newSkills = [];
    // for (let ele in payment?.booking?.skills) {
    //    if(ele && ele?.parent){
    //     const parent = await Category.findOne({_id:ObjectId(ele?.parent.toString())})
    //    }

    // }
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
