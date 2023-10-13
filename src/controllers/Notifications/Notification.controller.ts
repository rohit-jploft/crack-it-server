import { NextFunction, Request, Response } from "express";
import notificationSchema from "../../schemas/notifications";
import { ObjectId } from "../../helper/RequestHelper";
import Notification from "../../models/notifications.model";

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;

  const { error, value } = notificationSchema.validate(data);
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }

  try {
    const notification = await Notification.create(data);
    return res.status(200).json({
      status: 200,
      success: true,
      data: notification,
      message: "Notifications created successfully",
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

export const getAllNotificationsByUser = async (
  req: Request,
  res: Response
) => {
  const { user } = req.query;
  var query: any = {};
  if (user) query.receiver = ObjectId(user.toString());
  try {
    const data = await Notification.find(query);
    return res.status(200).json({
      status: 200,
      success: true,
      data: data,
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

