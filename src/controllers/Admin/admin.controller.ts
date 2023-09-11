import { Response, Request, NextFunction, Errback } from "express";
import User from "../../models/user.model";
import Booking from "../../models/booking.model";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const totalUser = await User.countDocuments();
    const totalExpert = await User.find({ role: "EXPERT" }).countDocuments();
    const totalMeetingCompleted = await Booking.find({
      status: "ACCEPTED",
    }).countDocuments();
    const totalEarning = 1;

    return res.status(200).json({
      success: true,
      status: 200,
      data: { totalUser, totalExpert, totalEarning, totalMeetingCompleted },
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
  role: string;
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
  const { role, search } = req.query;
  var query = <queryData>{};
  if (role) query.role = role.toString();
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    //   { phone: { $regex: parseInt(search), $options: "i" } },
    ];
  }

  try {
    const users = await User.find(query, { password: 0 });

    return res.status(200).json({
      success: true,
      status: 200,
      data: users,
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
