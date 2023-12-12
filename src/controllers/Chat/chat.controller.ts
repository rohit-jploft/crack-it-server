import { Response, Request, NextFunction, Errback } from "express";
import Chat from "../../models/chat.model";
import { ObjectId } from "../../helper/RequestHelper";
import { messageJoiSchema } from "../../schemas/chat.schema";
import Message from "../../models/message.model";
import Booking from "../../models/booking.model";
import { Types } from "mongoose";
import { createNotification } from "../Notifications/Notification.controller";
import { NotificationType } from "../../utils/NotificationType";
import { NoticationMessage } from "../../utils/notificationMessageConstant";

export const createConversation = async (
  users: Types.ObjectId[],
  bookingId: Types.ObjectId,
  agency?: Types.ObjectId | null
) => {
  try {
    const check = await Chat.findOne({ booking: bookingId });
    if (!check) {
      const createChat = await Chat.create({
        participants: users,
        admin: null,
        booking: bookingId,
        agency,
      });
      return { chat: createChat, isNew: true };
    } else {
      return { chat: check, isNew: true };
    }
  } catch (error: any) {
    return error.message;
  }
};
export const createConvoApi = async (req: Request, res: Response) => {
  const { meetingId } = req.params;
  try {
    const chat = await Chat.findOne({ booking: meetingId });
    if (chat) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: chat,
        message: "chat with this meetingId is already created",
      });
    } else {
      const meeting = await Booking.findById(meetingId);
      if (meeting) {
        let users = [];
        users.push(meeting.user);
        users.push(meeting.expert);
        const convo = await createConversation(users, meeting._id);
        if (convo) {
          return res.status(200).json({
            success: true,
            status: 200,
            data: convo,
            message: "Conversation Created successfully",
          });
        }
      }
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
export const getUsersConversation = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const chatConvo = await Chat.find({
      $or: [
        { participants: { $in: [userId] } },
        { admin: userId },
        { superAdmin: userId },
        { agency: userId },
      ],
      isClosed: false,
    })
      .populate("participants", "firstName lastName role profilePhoto")
      .populate("admin", "firstName lastName role")
      .populate("superAdmin", "firstName lastName role")
      .populate("agency", "agencyName role").sort({createdAt:-1});
    const finalList = await Promise.all(
      chatConvo.map(async (chat: any) => {
        // const rating = await getExpertRating(expert.user._id.toString());
        const msg = await Message.findOne({ chat: chat._id }, null, {
          sort: { createdAt: -1 },
        }).select("content type createdAt");
        console.log(msg);
        return {
          ...chat._doc,
          latestMessage: msg,
        };
      })
    );
    // console.log(finalList)
    finalList.sort((a, b) => {
      const timestampA = a.latestMessage ? a.latestMessage.createdAt : 0;
      const timestampB = b.latestMessage ? b.latestMessage.createdAt : 0;
      return timestampB - timestampA;
    });
    // console.log(finalList)
    return res.status(200).json({
      success: true,
      status: 200,
      data: finalList,
      message: "Users chat conversation fetched",
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
export const sendMessage = async (req: Request, res: Response) => {
  const data = req.body;

  const { error, value } = messageJoiSchema.validate(data);

  if (req?.files) {
    var { audio }: any = req?.files;
    if (audio) {
      var media = audio[0]?.path?.replaceAll("\\", "/") || "";
    }
  }

  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  try {
    const message = await Message.create({
      chat: ObjectId(value.chat),
      sender: ObjectId(value.sender),
      type: audio ? value.type : "text",
      content: value.content,
      media: audio ? media : "",
    });
    const chatObj = await Chat.findById(ObjectId(value.chat));
    if (chatObj && chatObj.participants) {
      for (let cha of chatObj?.participants) {
        if (value.sender !== cha.toString()) {
          await createNotification(
            ObjectId(value.sender),
            ObjectId(cha.toString()),
            NoticationMessage.newMessage.title,
            NotificationType.Chat,
            "web",
            NoticationMessage.newMessage.message,
            { targetId: value.chat }
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: message,
      message: "message sent successfully",
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
export const getConvoMessage = async (req: Request, res: Response) => {
  const { convoId } = req.params;
  try {
    const convo = await Message.find({
      chat: ObjectId(convoId),
    }).populate("sender", "_id firstName lastName profilePhoto");
    return res.status(200).json({
      success: true,
      status: 200,
      data: convo,
      message: "message fetched successfully",
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
export const searchConversations = async (req: Request, res: Response) => {
  const { search, userId } = req.query;

  try {
    // Use aggregation to search for chats with matching participants or admin/superAdmin
    const chats = await Chat.aggregate([
      {
        $match: {
          $or: [
            { participants: userId },
            { admin: userId },
            { superAdmin: userId },
          ],
          isClosed: false,
        },
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "participants",
          foreignField: "_id",
          as: "participants",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      // {
      //   $unwind: {
      //     path: "$participantsDetails",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "admin",
          foreignField: "_id",
          as: "adminDetails",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$adminDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "superAdmin",
          foreignField: "_id",
          as: "superAdminDetails",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$superAdminDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $match: {
      //     $or: [
      //       {
      //         "participantsDetails.firstName": {
      //           $regex: search,
      //           $options: "i",
      //         },
      //       },
      //       {
      //         "participantsDetails.lastName": { $regex: search, $options: "i" },
      //       },
      //       {
      //         "adminDetails.firstName": { $regex: search, $options: "i" },
      //       },
      //       {
      //         "adminDetails.lastName": { $regex: search, $options: "i" },
      //       },
      //       {
      //         "superAdminDetails.firstName": { $regex: search, $options: "i" },
      //       },
      //       {
      //         "superAdminDetails.lastName": { $regex: search, $options: "i" },
      //       },
      //     ],
      //   },
      // },
    ]);

    return res.status(200).json({
      success: true,
      status: 200,
      data: chats,
      message: "chats fetched successfully",
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
export const enterChatForAdmin = async (req: Request, res: Response) => {
  const { meetingId } = req.query;
  const role = res.locals.user.role;
  console.log(role, "role");
  try {
    const chat: any = await Chat.findOne({ booking: meetingId });
    console.log(chat);
    if (!chat) {
      return res.status(200).json({
        status: 200,
        success: false,
        message: "Chat not created yet",
      });
    }
    if (chat && chat?.admin && role === "ADMIN") {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Admin already entered into chat",
      });
    }
    if (role == "ADMIN" && !chat.admin) {
      chat["admin"] = res.locals.user._id;
    }
    if (chat && chat?.agency && role === "AGENCY") {
      return res.status(200).json({
        success: false,
        status: 200,
        data: {
          chat: chat?._id,
        },
        message: "Agency already entered into chat",
      });
    }
    if (role == "AGENCY" && !chat.agency) {
      chat["agency"] = res.locals.user._id;
    }
    if (chat && chat?.superAdmin && role === "SUPER_ADMIN") {
      return res.status(200).json({
        success: false,
        status: 200,
        data: {
          chat: chat?._id,
        },
        message: "Super Admin already entered into chat",
      });
    }
    if (role == "SUPER_ADMIN") {
      console.log("yes super admin");
      console.log(res.locals.user._id);
      chat.superAdmin = res.locals.user._id;
    }
    await chat.save();
    return res.status(200).json({
      success: true,
      status: 200,
      data: {
        chat: chat?._id,
      },
      message: role + " entered into chat successFully",
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
export const getChatFromMeetingId = async (req: Request, res: Response) => {
  const { meetingId } = req.params;
  try {
    const chatWindow: any = await Chat.findOne({
      booking: ObjectId(meetingId),
    });
    if (!chatWindow) {
      return res.status(208).json({
        success: false,
        status: 200,
        message: "Chat not initiated yet",
      });
    }
    return res.status(200).json({
      success: true,
      status: 200,
      data: {
        chat: chatWindow._id,
      },
      message: "Chat details fetched successfully",
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
