import { Schema, model, Document, Types } from "mongoose";

interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  // Add other chat-specific fields as needed
}

const contactSchema = new Schema<IContact>({
  name: String,
  email: String,
  phone: String,
  message: String,
  // Define other fields here
}, {timestamps:true});

const Contact = model<IContact>("Contacts", contactSchema);

export default Contact;
