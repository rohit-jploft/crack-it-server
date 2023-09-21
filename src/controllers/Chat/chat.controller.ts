import { Response, Request, NextFunction, Errback } from "express";
import Chat from "../../models/chat.model";
import { ObjectId } from "../../helper/RequestHelper";
import { messageJoiSchema } from "../../schemas/chat.schema";
import Message from "../../models/message.model";

export const createConversation = async (users: [string], admin: string) => {
  try {
    const createChat = await Chat.create({
      participants: users,
      admin: ObjectId(admin),
    });
    return createChat;
  } catch (error: any) {
    return error.message;
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
