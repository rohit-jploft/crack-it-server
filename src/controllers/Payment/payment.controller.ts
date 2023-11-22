import { Request, Response } from "express";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";
import { ObjectId } from "../../helper/RequestHelper";
import { createConversation } from "../Chat/chat.controller";
import { createNotification } from "../Notifications/Notification.controller";
import { NoticationMessage } from "../../utils/notificationMessageConstant";
import { NotificationType } from "../../utils/NotificationType";
import Wallet, { WalletDocument } from "../../models/wallet.model";
import { createTransaction } from "../Wallet/wallet.controller";
import { getSuperAdminId } from "../../helper/impFunctions";
import { payWithWallet } from "../../schemas/wallet.schema";

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
    success_url: "https://crack-it-website.netlify.app/check-payment",
    cancel_url: "http://crack-it-website.netlify.app/mybookings/Requested",
  });
  console.log(session, "session");
  // const check = stripe.paymentIntents.retrieve(session.id);
  // console.log(check, "checkPayment")
  if (session) {
    const meeting: any = await Booking.findById(ObjectId(meetingId));

    // await createConversation(meetArr, meetingId);
    const payment = await BookingPayment.findOneAndUpdate(
      { booking: ObjectId(meetingId) },
      {
        // status: "PAID",
        paymentObj: session,
      },
      { new: true }
    );
    console.log(meeting, payment);
  }
  return res.status(200).json({ id: session.id, bookingId: meetingId });
};
export const checkAndVerifyPayment = async (req: Request, res: Response) => {
  const { type, id, bookingId } = req.body;
  try {
    const checkIntent =
      type === "session"
        ? await stripe.checkout.sessions.retrieve(id)
        : await stripe.paymentIntents.retrieve(id);
    console.log(checkIntent);
    if (checkIntent.status === "succeeded") {
      const booking: any = await Booking.findById(
        ObjectId(bookingId.toString())
      );
      var payment: any = await BookingPayment.findOne({
        booking: ObjectId(bookingId.toString()),
      });

      booking.status = "CONFIRMED";
      payment.status = "PAID";
      payment.paymentObj = checkIntent;
      await booking.save();
      await payment.save();
      await createNotification(
        booking.user,
        booking.expert,
        NoticationMessage.ConfirmedBooking.title,
        NotificationType.Booking,
        "web",
        NoticationMessage.ConfirmedBooking.message,
        { targetId: booking?._id },
        {}
      );
      return res.status(200).json({
        success: true,
        status: 200,
        data: payment,
      });
    }
    if (checkIntent.status === "complete") {
      const booking: any = await Booking.findById(
        ObjectId(bookingId.toString())
      );
      var payment: any = await BookingPayment.findOne({
        booking: ObjectId(bookingId.toString()),
      });

      booking.status = "CONFIRMED";
      payment.status = "PAID";
      payment.paymentObj = checkIntent;
      await booking.save();
      await payment.save();
      return res.status(200).json({
        success: true,
        status: 200,
        data: payment,
      });
    }
    return res.status(207).json({
      success: false,
      status: 207,
      message: "Payment failed",
      // data: checkIntent,
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

export const payThroughWallet = async (req: Request, res: Response) => {
  const { bookingId, amount, userId } = req.body;
  const data:any = req.body;

    // Validate the request data using Joi schema
    const { value, error } = payWithWallet.validate(data);

    // Return if there's a validation error
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.message,
      });
    }
  try {
    const booking:any = await Booking.findById(ObjectId(bookingId));
    if(booking.status === "CONFIRMED"){
        return res.status(200).json({
          success:false,
          status:200,
          type:'error',
          message:"Payment has been already done"
        })
    }
    const checkWallet: any = await Wallet.findOne({
      user: ObjectId(userId.toString()),
    });
    if (parseFloat(amount) > checkWallet.amount) {
      return res.status(200).json({
        status: 200,
        success: false,
        type: "error",
        message: "Insufficient balance",
      });
    } else {
      const superAdminId = await getSuperAdminId();
      const transaction = await createTransaction(
        amount,
        "DEBIT",
        userId,
        superAdminId,
        "Booking payment"
      );
      if (transaction) {
        const booking: any = await Booking.findById(
          ObjectId(bookingId.toString())
        );
        var payment: any = await BookingPayment.findOne({
          booking: ObjectId(bookingId.toString()),
        });

        booking.status = "CONFIRMED";
        payment.status = "PAID";
        payment.paymentObj = {
          method:"WALLET",
          transaction:transaction
        };
        await booking.save();
        await payment.save();
        return res.status(200).json({
          success: true,
          status: 200,
          data: payment,
        });
      }
      return res.status(200).json({
        success: true,
        status: 200,
        type: "success",
        data: transaction,
      });
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
