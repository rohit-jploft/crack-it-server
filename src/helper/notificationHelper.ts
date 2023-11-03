import { Types } from "mongoose";
import User from "../models/user.model";

export const getDeviceToken = async (userId: Types.ObjectId, type?: string) => {
  try {
    const userData = await User.findById(userId);
    if (type) {
      return type === "web"
        ? userData?.webDeviceToken
        : userData?.appDeviceToken;
    }
    return userData?.webDeviceToken;
  } catch (error: any) {
    return error.message;
  }
};
