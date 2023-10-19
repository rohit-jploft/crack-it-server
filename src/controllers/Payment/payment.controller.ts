import { Request, Response } from "express";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";
import { ObjectId } from "../../helper/RequestHelper";
import { createConversation } from "../Chat/chat.controller";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripeSecretKey);

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount, meetingId } = req.body;
  const lineItems = [
    {
      price_data: {
        currency: "USD",
        product_data: {
          name: "Booking",
          images: [],
        },
        unit_amount: parseFloat(amount) * 100,
      },
      quantity: 1,
    },
  ];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "https://crack-it-website.netlify.app/Mybookings",
    cancel_url: "http://localhost:3000/failed",
  });
  console.log(session);
  if (session) {
    const meeting = await Booking.findByIdAndUpdate(
      meetingId,
      {
        status: "CONFIRMED",
      },
      { new: true }
    );
    let meetArr = [];
    if (meeting && meeting.user) {
      meetArr.push(meeting?.user);
    }
    if (meeting && meeting.expert) {
      meetArr.push(meeting?.expert);
    }

    await createConversation(meetArr, meetingId);
    const payment = await BookingPayment.findOneAndUpdate(
      { booking: ObjectId(meetingId) },
      {
        status: "PAID",
      },
      { new: true }
    );
    console.log(meeting, payment);
  }
  return res.status(200).json({ id: session.id });
};
