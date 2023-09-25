import { Schema, model, Document, Types } from 'mongoose';

interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  type:'text' | 'file';
  media:string,
  content: string;
  isDeleted?: boolean;
  // Add other message-specific fields as needed
}

const messageSchema = new Schema<IMessage>({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type:{
     type:String,
     default:'text'
  },
  content: {
    type: String,
    required: true,
  },
  media:{
    type:String
  },
  
  isDeleted: {
    type: Boolean,
    default: false,
  },
  // Define other fields here
  
},{ timestamps: true });

const Message = model<IMessage>('Message', messageSchema);

export default Message;
