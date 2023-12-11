import { Response, Request, NextFunction, Errback } from "express";
import User from "../../models/user.model";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";
import { pagination } from "../../helper/pagination";
import { Roles } from "../../utils/role";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const totalUser = await User.countDocuments({ role: "USER" });
    const totalExpert = await User.countDocuments({ role: "EXPERT" });
    const totalAgency = await User.countDocuments({ role: "AGENCY" });
    const totalMeetingCompleted =
      (await Booking.countDocuments({ status: "CONFIRMED" })) || 0;
    // const totalEarning = await BookingPayment.countDocuments({status:"PAID"}) || 0;
    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          status: "PAID", // Match documents with the "PAID" status
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalCommission: {
            $sum: "$CommissionAmount", // Calculate the sum of CommissionAmount
          },
        },
      },
    ];

    // Execute the aggregation pipeline
    const result = await BookingPayment.aggregate(pipeline);
    console.log(result);

    // Extract the total commission from the result
    const totalEarning = result[0]?.totalCommission || 0;
    console.log({
      totalUser,
      totalExpert,
      totalEarning,
      totalMeetingCompleted,
    });
    return res.status(200).json({
      success: true,
      status: 200,
      data: {
        totalUser,
        totalExpert,
        totalEarning,
        totalMeetingCompleted,
        totalAgency,
      },
      message: "Dashboard data fetched",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
type queryData = {
  role: string | { $in?: string[] };
  $or: {
    firstName?: {
      $regex: any;
      $options: string;
    };
    lastName?: {
      $regex: any;
      $options: string;
    };
    email?: {
      $regex: any;
      $options: string;
    };
    phone?: {
      $regex: any;
      $options: number;
    };
  }[];
};
export const getAllUsers = async (req: Request, res: Response) => {
  const { role, search, isAdmin } = req.query;
  const currentPage = Number(req?.query?.page) + 1 || 1;

  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  var query = <any>{};
  if (role && role !== "AGENCY-EXPERT") {
    query.role = role.toString()
    query.agency = {$exists:false}
  };
  if (role === "AGENCY-EXPERT") {
    // query.role = "EXPERT"
    query.agency ={$exists:true}
    
  }
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
        // { phone: { $regex:parseInt(search.toString()), } },
    ];
  }
  if (isAdmin && isAdmin === "0" && !role) {
    query.role = { $in: [Roles.USER, Roles.EXPERT] };
  }
  if (isAdmin && isAdmin === "0" && role) {
    
    if (role === "AGENCY-EXPERT") {
        query.role = "EXPERT"
    } else {
      query.role = { $in: [role.toString()] };
    }
  }

  try {
    console.log("query ", query)
    const users = await User.find(query, { password: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await User.countDocuments(query);
    console.log(totalCount);
    return res.status(200).json({
      success: true,
      status: 200,
      data: users,
      pagination: pagination(totalCount, currentPage, limit),
      message: "All users fetched successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const getPaymentPageStats = async (req: Request, res: Response) => {
  let { from, to } = req.query;
  try {
    // Calculate the total revenue
    const totalRevenueResult = await BookingPayment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
        },
      },
    ]);

    // Calculate the realized commission (status = PAID)
    const realizedCommissionResult = await BookingPayment.aggregate([
      {
        $match: {
          status: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          realizedCommission: { $sum: "$CommissionAmount" },
        },
      },
    ]);

    // Calculate the unrealized commission (status = UNPAID)
    const unrealizedCommissionResult = await BookingPayment.aggregate([
      {
        $match: {
          status: "UNPAID",
        },
      },
      {
        $group: {
          _id: null,
          unrealizedCommission: { $sum: "$CommissionAmount" },
        },
      },
    ]);

    // Prepare the response
    let response: any = {
      totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
      realizedCommission: realizedCommissionResult[0]?.realizedCommission || 0,
      unrealizedCommission:
        unrealizedCommissionResult[0]?.unrealizedCommission || 0,
    };
    response.totalEarning =
      response.realizedCommission + response.unrealizedCommission;

    return res.status(200).json({
      success: true,
      status: 200,
      data: response,
      message: "data fetched successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
