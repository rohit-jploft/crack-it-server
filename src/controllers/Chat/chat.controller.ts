import { Response, Request, NextFunction, Errback } from "express";
import Chat from "../../models/chat.model";
import { ObjectId } from "../../helper/RequestHelper";
import { messageJoiSchema } from "../../schemas/chat.schema";
import Message from "../../models/message.model";
import Booking from "../../models/booking.model";
import { Types } from "mongoose";

export const createConversation = async (
  users: Types.ObjectId[],
  bookingId: Types.ObjectId
) => {
  try {
    const createChat = await Chat.create({
      participants: users,
      admin: null,
      booking: bookingId,
    });
    return createChat;
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
      $or: [{ participants: userId }, { admin: userId }],
    })
      .populate("participants", "firstName lastName role")
      .populate("admin", "firstName lastName role");
    return res.status(200).json({
      success: true,
      status: 200,
      data: chatConvo,
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
      content: value.content,
    });
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
    }).populate("sender", "_id firstName lastName");
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
      // {
      //   $match: {
      //     $or: [
      //       { participants: userId },
      //       { admin: userId },
      //       { superAdmin: userId },
      //     ],
      //   },
      // },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "participants",
          foreignField: "_id",
          as: "participantsDetails",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$participantsDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
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
      {
        $match: {
          $or: [
            {
              "participantsDetails.firstName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "participantsDetails.lastName": { $regex: search, $options: "i" },
            },
            {
              "adminDetails.firstName": { $regex: search, $options: "i" },
            },
            {
              "adminDetails.lastName": { $regex: search, $options: "i" },
            },
            {
              "superAdminDetails.firstName": { $regex: search, $options: "i" },
            },
            {
              "superAdminDetails.lastName": { $regex: search, $options: "i" },
            },
          ],
        },
      },
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
