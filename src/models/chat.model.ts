import { Schema, model, Document, Types } from "mongoose";

interface IChat extends Document {
  participants: Types.ObjectId[];
  chatType: "individual" | "group";
  admin?: Types.ObjectId;
  superAdmin?: Types.ObjectId;
  booking?: Types.ObjectId;
  isDeleted?: boolean;
  // Add other chat-specific fields as needed
}

const chatSchema = new Schema<IChat>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
  },
  superAdmin: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
  // Define other fields here
});

const Chat = model<IChat>("Chat", chatSchema);

export default Chat;
