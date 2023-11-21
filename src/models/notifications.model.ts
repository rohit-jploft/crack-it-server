import { Schema, Document, model } from 'mongoose';

interface NotificationData extends Document {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  title: string;
  type:string;
  message: string;
  data: Object;
  dynamicData: object;
  isRead: boolean;
  isDeleted: boolean;
}

const notificationSchema = new Schema<NotificationData>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type:{
      type:String
    },
   
    title: String,
    message: String,
    data: {
      type: Object,
      default: {},
    },
    dynamicData: {
      type: Object,
      default: {},
    },
    isRead: {
      type:Boolean,
      default:false
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  },
});

const Notification = model<NotificationData>('Notification', notificationSchema);

export default Notification;
