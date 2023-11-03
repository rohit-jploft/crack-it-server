import { NextFunction, Request, Response } from "express";
import notificationSchema from "../../schemas/notifications";
import { ObjectId } from "../../helper/RequestHelper";
import Notification from "../../models/notifications.model";
import { Types } from "mongoose";
import User from "../../models/user.model";
import { sendNotification } from "../../helper/notifications";
import { getDeviceToken } from "../../helper/notificationHelper";
import { pagination } from "../../helper/pagination";
import Page from "twilio/lib/base/Page";

export const createNotification = async (
  sender: Types.ObjectId,
  receiver: Types.ObjectId,
  title: string,
  type: string,
  notificationType: "web" | "app",
  message: string,
  data?: object,
  dynamicData?: object
) => {
  try {
    const notification = await Notification.create({
      sender,
      receiver,
      title,
      type,
      message,
      data,
      dynamicData,
    });
    const getRecieverToken = await getDeviceToken(receiver, notificationType);
    console.log(getRecieverToken, "device token");
    const fcmNoti = await sendNotification({
      title,
      message,
      token: getRecieverToken,
      data,
    });
    return notification;
  } catch (error: any) {
    // Return error if anything goes wrong
    return error.message;
  }
};

export const getAllNotificationsByUser = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  var query: any = {};
  const currentPage = Number(req?.query?.page) + 1 || 1;
  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  if (userId) query.receiver = ObjectId(userId.toString());
  try {
    const data = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");
    const unReadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });
    const totalCount = await Notification.countDocuments({ ...query });
    return res.status(200).json({
      status: 200,
      success: true,
      data: { data, unReadCount },
      pagination: pagination(totalCount, currentPage, limit),
      message: "Notification fetched successfully",
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

export const notificationReaded = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  try {
    const noti = await Notification.findByIdAndUpdate(
      ObjectId(notificationId.toString()),
      { $set: { isRead: true } },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: "notiifcation has been read",
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

export const saveDeviceTokenInDb = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { type, deviceToken } = req.body;
  try {
    const user: any = await User.findById(ObjectId(userId.toString()));
    if (type.toString() === "web") {
      user.webDeviceToken = deviceToken;
    }
    await user.save();

    return res.status(200).json({
      status: 200,
      success: true,
      data: user,
      message: "Device token saved",
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
