import { Request, Response } from "express";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";
import { ObjectId } from "../../helper/RequestHelper";
import { createConversation } from "../Chat/chat.controller";
import { createNotification } from "../Notifications/Notification.controller";
import { NoticationMessage } from "../../utils/notificationMessageConstant";
import { NotificationType } from "../../utils/NotificationType";
import Wallet, { WalletDocument } from "../../models/wallet.model";
import {
  createStripeTransaction,
  createTransaction,
  updateTransactionStatus,
} from "../Wallet/wallet.controller";
import { getSuperAdminId } from "../../helper/impFunctions";
import { payWithWallet } from "../../schemas/wallet.schema";
import { sendMailForMeetingUpdate } from "../../helper/mailService";
import { getDateInDateStamp, getTimeInDateStamp } from "../../helper/helper";
import User from "../../models/user.model";

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
    cancel_url: "https://crack-it-website.netlify.app/mybookings/Requested",
  });
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
    if (session && session.id) {
      await createStripeTransaction(
        ObjectId(meetingId),
        amount,
        meeting.user,
        "Booking Payment",
        "pending"
      );
    }
  }
  return res.status(200).json({ id: session.id, bookingId: meetingId });
};
export const checkAndVerifyPayment = async (req: Request, res: Response) => {
  const { type, id, bookingId, walletTransactionId } = req.body;
  console.log(walletTransactionId, "walletTransactionId");
  try {
    const checkIntent =
      type === "session"
        ? await stripe.checkout.sessions.retrieve(id)
        : await stripe.paymentIntents.retrieve(id);
    if (checkIntent.status === "succeeded") {
      const booking: any = await Booking.findById(
        ObjectId(bookingId.toString())
      );
      var payment: any = await BookingPayment.findOne({
        booking: ObjectId(bookingId.toString()),
      });

      booking.status = "CONFIRMED";
      payment.status = "PAID";
      if (walletTransactionId) {
        payment.paymentObj = { walletTransactionId, payment: checkIntent };
      } else {
        payment.paymentObj = checkIntent;
      }
      await booking.save();
      await payment.save();
      const updateTrans = await updateTransactionStatus(
        ObjectId(bookingId),
        "success"
      );
      console.log(updateTrans, "updateTrans");
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
      const userObj: any = await User.findOne({
        _id: ObjectId(booking.user.toString()),
      });
      const expertObj:any = await User.findOne({
        _id: ObjectId(booking.expert.toString()),
      });
      const sendEmail = await sendMailForMeetingUpdate(
        userObj?.email,
        "Booking Confirmed",
        `Dear ${userObj.firstName} ${userObj.lastName}
        <br/>
        <br/>
        Your booking has been Confirmed which is at ${getTimeInDateStamp(
          booking.startTime.toString()
        )}
        <br/>
  
        Expert Name -  ${expertObj.firstName} ${expertObj.lastName}
        <br/>
        Date - ${getDateInDateStamp(booking.date.toString())}
        <br/> <br/>
        Thank you
        Crack-it
        `, 
        {}
      );
      const sendEmailExp = await sendMailForMeetingUpdate(
        expertObj?.email,
        "Booking Confirmed",
        `Dear ${expertObj.firstName} ${expertObj.lastName}
        <br/>
        Your booking has been confirmed which is at ${getTimeInDateStamp(
          booking.startTime.toString()
        )}
        <br/>
        Service Requester - ${userObj.firstName} ${userObj.lastName}
        <br/>
        Date - ${getDateInDateStamp(booking.date.toString())}
        <br/>
        <br/>
        Thank you
        <br/>
        Crack-it
        <br/>
        `, 
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
      if (walletTransactionId) {
        console.log("wallet id ");
        payment.paymentObj = { walletTransactionId, payment: checkIntent };
      } else {
        console.log("no wallet id ");
        payment.paymentObj = checkIntent;
      }
      await booking.save();
      await payment.save();
      const updateTrans = await updateTransactionStatus(
        ObjectId(bookingId),
        "success"
      );
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
  const data: any = req.body;

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
    const booking: any = await Booking.findById(ObjectId(bookingId));
    if (booking.status === "CONFIRMED") {
      return res.status(200).json({
        success: false,
        status: 200,
        type: "error",
        message: "Payment has been already done",
      });
    }
    const checkWallet: any = await Wallet.findOne({
      user: ObjectId(userId.toString()),
    });
    if (checkWallet && checkWallet.amount == 0) {
      return res.status(200).json({
        success: false,
        status: 200,
        type: "error",
        message:
          "You have no balance in your wallet !!! Please choose any other payment method",
      });
    }
    if (parseFloat(amount) > checkWallet.amount) {
      const superAdminId = await getSuperAdminId();
      const transaction = await createTransaction(
        checkWallet.amount,
        "DEBIT",
        userId,
        superAdminId,
        "Booking payment",
        ObjectId(bookingId.toString())
      );
      // const transaction = {
      //   userTransaction:{
      //     _id:"hju"
      //   },
      //   type:"error",
      //   message:"hello"
      // }
      if (transaction && transaction.userTransaction) {
        const remainingAmount = parseFloat(amount) - checkWallet.amount;
        console.log(remainingAmount, "remaining amount");
        console.log(typeof remainingAmount, "type");
        const lineItems = [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Booking",
                images: [],
              },
              unit_amount: remainingAmount * 100,
            },
            quantity: 1,
          },
        ];
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          success_url: "https://crack-it-website.netlify.app/check-payment",
          cancel_url:
            "http://crack-it-website.netlify.app/mybookings/Requested",
          mode: "payment",
        });
        if (session && session?.id) {
          const trans = await createStripeTransaction(
            booking._id,
            remainingAmount,
            booking.user,
            "Booking Payment",
            "pending"
          );
          if (trans && trans.success) {
            return res.status(200).json({
              status: 200,
              success: true,
              type: "success",
              data: {
                id: session.id,
                bookingId: bookingId,
                walletTransactionId: transaction.userTransaction._id,
              },
            });
          } else {
            return res.status(200).json({
              success: false,
              type: "error",
              message: trans.message,
            });
          }
        }
      } else {
        return res.status(200).json({
          status: 200,
          success: false,
          type: transaction.type,
          message: transaction.message,
        });
      }
    } else {
      const superAdminId = await getSuperAdminId();
      const transaction = await createTransaction(
        amount,
        "DEBIT",
        userId,
        superAdminId,
        "Booking payment",
        ObjectId(bookingId.toString())
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
          method: "WALLET",
          transaction: transaction,
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

export const payThroughWalletMobileApi = async (
  req: Request,
  res: Response
) => {
  const { bookingId, amount, userId } = req.body;
  const data: any = req.body;

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
    const booking: any = await Booking.findById(ObjectId(bookingId));
    if (booking.status === "CONFIRMED") {
      return res.status(200).json({
        success: false,
        status: 200,
        type: "error",
        message: "Payment has been already done",
      });
    }
    const checkWallet: any = await Wallet.findOne({
      user: ObjectId(userId.toString()),
    });
    if (checkWallet && checkWallet.amount == 0) {
      return res.status(200).json({
        success: false,
        status: 200,
        type: "error",
        message:
          "You have no balance in your wallet !!! Please choose any other payment method",
      });
    }
    if (parseFloat(amount) > checkWallet.amount) {
      const superAdminId = await getSuperAdminId();
      const transaction = await createTransaction(
        checkWallet.amount,
        "DEBIT",
        userId,
        superAdminId,
        "Booking payment",
        ObjectId(bookingId.toString())
      );
      if (transaction && transaction.userTransaction) {
        const remainingAmount = parseFloat(amount) - checkWallet.amount;
        console.log(remainingAmount, "remaining amount");
        console.log(typeof remainingAmount, "type");

        return res.status(200).json({
          status: 200,
          success: true,
          type: "success",
          data: {
            remainingAmount,
            bookingId: bookingId,
            walletTransactionId: transaction.userTransaction._id,
          },
        });
      } else {
        return res.status(200).json({
          status: 200,
          success: false,
          type: transaction.type,
          message: transaction.message,
        });
      }
    } else {
      const superAdminId = await getSuperAdminId();
      const transaction = await createTransaction(
        amount,
        "DEBIT",
        userId,
        superAdminId,
        "Booking payment",
        ObjectId(bookingId.toString())
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
          method: "WALLET",
          transaction: transaction,
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

export const createTransactionForMobileIntentCreatedByApp = async (
  req: Request,
  res: Response
) => {
  const { bookingId, amount } = req.body;
  try {
    const meeting: any = await Booking.findById(ObjectId(bookingId.toString()));
    const createTrans: any = await createStripeTransaction(
      ObjectId(meeting._id),
      parseFloat(amount),
      ObjectId(meeting.user),
      "Booking Payment",
      "pending"
    );

    if (createTrans && createTrans.success) {
      return res.status(200).json({
        success: true,
        type: "success",
        message: "transaction created",
        data: createTrans.data,
      });
    } else {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 200,
        message: "something went wrong",
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
export const payAndProceedWhenAmountZero = async (
  req: Request,
  res: Response
) => {
  const { bookingId } = req.params;

  
  try {
    const booking: any = await Booking.findByIdAndUpdate(ObjectId(bookingId), {
      $set: { status: "CONFIRMED" },
    });

    const superAdminId = await getSuperAdminId();
    const transaction = await createTransaction(
      0,
      "DEBIT",
      booking?.user,
      superAdminId,
      "Booking payment",
      ObjectId(bookingId.toString())
    );
    console.log(transaction)
    if (transaction && transaction.userTransaction) {
      const updatePayment = await BookingPayment.findOneAndUpdate(
        { booking: ObjectId(bookingId) },
        { $set: { status: "PAID", paymentObj: transaction } }
      );
      return res.status(200).json({
        success: true,
        status: 200,
        data: updatePayment,
        message: "your booking is confirmed",
      });
    } else {
      const booking: any = await Booking.findByIdAndUpdate(
        ObjectId(bookingId),
        {
          $set: { status: "ACCEPTED" },
        }
      );
      return res.status(200).json({
        success: false,
        status: 200,
        message: "transaction failed",
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
