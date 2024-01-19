import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import Wallet, { WalletDocument } from "../../models/wallet.model";
import withdrawalRequestSchema from "../../schemas/wallet.schema";
import WithdrawalRequest from "../../models/withdrawal.model";
import { Types } from "mongoose";
import WalletTransaction from "../../models/walletTransactions.model";
import { pagination } from "../../helper/pagination";
import User from "../../models/user.model";
import { createNotification } from "../Notifications/Notification.controller";
import { NotificationType } from "../../utils/NotificationType";
import { NoticationMessage } from "../../utils/notificationMessageConstant";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";
import { getSuperAdminId } from "../../helper/impFunctions";
import mongoose from "mongoose";


export const createWallet = async (userId: string) => {
  try {
    const wallet = await Wallet.findOne({ user: ObjectId(userId) });
    if (wallet) {
      return wallet;
    } else {
      const newWallet = await Wallet.create({
        user: ObjectId(userId),
      });
      return newWallet;
    }
  } catch (error) {
    return error;
  }
};
export const createTransaction = async (
  amount: number,
  type: "CREDIT" | "DEBIT",
  user: Types.ObjectId,
  otherUser: Types.ObjectId,
  title: string,
  booking?: Types.ObjectId,
  txnType?: string,
  success?: boolean,
  
) => {
  // transaction initialisation
  const session = await mongoose.startSession();
  // start the session
  session.startTransaction();
  try {
    // Ensure that user and otherUser exist and are valid ObjectId strings
    if (!Types.ObjectId.isValid(user) || !Types.ObjectId.isValid(otherUser)) {
      return { type: "error", message: "Invalid IDs" };
    }

    var otherUserWallet;
    // Check the user's wallet balance

    const userWallet = await Wallet.findOne({ user }).session(session);

    if (!userWallet) {
      return { type: "error", message: "User wallet not found" };
    }

    // Check the otherUser's wallet balance (only for CREDIT transactions)
    if (type === "CREDIT") {
      otherUserWallet = await Wallet.findOne({ user: otherUser }).session(
        session
      );
      const otherUserRole = await User.findOne({ _id: otherUser });

      if (!otherUserWallet) {
        return { type: "error", message: "Other user wallet not found" };
      }

      if (
        otherUserRole?.role !== "SUPER_ADMIN" ||
        (txnType && txnType === "WITHDRAWAL")
      ) {
        if (otherUserWallet.amount < amount) {
          return {
            type: "error",
            message: "Other user has insufficient funds",
          };
        }
        otherUserWallet.amount -= amount;
      }
    }

    // Create a new wallet transaction for the user
    const userTransaction = new WalletTransaction(
      {
        amount,
        type,
        user,
        otherUser,
        title,
        status: "success",
        paymentMethod:"WALLET",
        booking,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { session }
    );

    // Create a new wallet transaction for the otherUser (reverse type)
    const otherUserTransaction = new WalletTransaction(
      {
        amount: amount,
        type: type === "CREDIT" ? "DEBIT" : "CREDIT",
        user: otherUser,
        otherUser: user,
        title,
        booking,
        paymentMethod:"WALLET",
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { session }
    );
    console.log(amount, "amount");
    // Save both transactions
    await userTransaction.save();
    await otherUserTransaction.save();

    // Update the user's wallet balance based on the transaction type
    if (type === "CREDIT") {
      userWallet.amount += amount;
    } else if (type === "DEBIT" && txnType !== "WITHDRAWAL") {
      userWallet.amount -= amount;
    }

    // Save the updated user wallet balance
    await userWallet.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    return { userTransaction, otherUserTransaction };
  } catch (error) {
    await session.abortTransaction();
    return { message: "Server error", type: "error" };
  } finally {
    session.endSession();
  }
};
export const createStripeTransaction = async (
  bookingId: Types.ObjectId,
  amount: number,

  user: Types.ObjectId,
  title: string,
  // paymentMethod: "WALLET" | "CARD",
  success: "success" | "failed" | "pending"
) => {
  // Ensure that user and otherUser exist and are valid ObjectId strings
  if (!Types.ObjectId.isValid(user)) {
    return { type: "error", message: "Invalid IDs", success:false };
  }

  // Check the user's wallet balance
  const userWallet = await Wallet.findOne({ user });

  if (!userWallet) {
    return { type: "error", message: "User wallet not found" , success:false};
  }
  // transaction initialisation
  const session = await mongoose.startSession();
  // start the session
  session.startTransaction();
  try {
    const superAdminId = await getSuperAdminId();
    const adminSideTrans = new WalletTransaction(
      {
        title: title,
        paymentMethod: "CARD",
        user: superAdminId,
        booking: bookingId,
        otherUser: ObjectId(user.toString()),
        amount: amount,
        type: "CREDIT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { session }
    );
    await adminSideTrans.save();
    const newTrans = new WalletTransaction(
      {
        title: title,
        paymentMethod: "CARD",
        booking: bookingId,
        user: ObjectId(user.toString()),
        otherUser: superAdminId,
        amount: amount,
        type: "DEBIT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { session }
    );
    await newTrans.save();
    await session.commitTransaction();
    return {
      type: "success",
      success:true,
      message: "transactions are successfull",
      data: {
        userTransaction: newTrans,
        superAdminTransaction: adminSideTrans,
      },
    };
  } catch (error: any) {
    await session.abortTransaction();
    return { type: "error",success:false,message: error.message };
  } finally {
    await session.endSession();
  }
};
export const updateTransactionStatus = async (
  bookingId: Types.ObjectId,
  status: "pending" | "success" | "failed"
) => {
  try {
    const updateStatus = await WalletTransaction.updateMany(
      { booking: bookingId },
      { $set: { status: status } }
    );
    console.log(updateStatus, "updateStatus");
    if (updateStatus.modifiedCount > 0) {
      return { type: "success", success: true, data: updateStatus };
    } else {
      return { type: "success", success: false, data: updateStatus };
    }
  } catch (error: any) {
    return { success: false, type: "error", message: error.message };
  }
};
export const getUsersTransaction = async (req: Request, res: Response) => {
  const currentPage = Number(req?.query?.page) + 1 || 1;

  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  try {
    const userId = req.params.userId;

    // Ensure userId is a valid ObjectId string
    if (!Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ type: "error", success: false, message: "Invalid user ID" });
    }

    // Find and return wallet transactions for the user
    const transactions = await WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "firstName lastName")
      .populate("otherUser", "firstName lastName");

    console.log(transactions, "transactions");
    const wallet = await createWallet(userId);
    console.log(wallet, "wallet");
    const totalCount: any = await WalletTransaction.countDocuments({
      user: ObjectId(userId),
    });
    console.log(totalCount, "totalCount");

    return res.status(200).json({
      success: true,
      type: "success",
      data: { wallet: wallet, transactions },
      pagination: pagination(totalCount, currentPage, limit),
      message: "All transaction fetched successfully",
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
export const getUserWallet = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const wallet = await Wallet.findOne(
      { user: ObjectId(userId) },
      { user: 1, amount: 1 }
    ).populate("user", "firstName lastName email");

    return res.status(200).json({
      success: true,
      status: 200,
      data: wallet,
      message: "Wallet fetched successfully",
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
// withdrawal request apis
export const createWithdrawRequest = async (req: Request, res: Response) => {
  let data = req.body;
  // check validation error using JOI
  const { error, value } = withdrawalRequestSchema.validate(data);

  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  try {
    const userWallet: any = await Wallet.findOne({ user: ObjectId(data.user) });
    if (userWallet.amount < data.amount) {
      return res.status(200).json({
        status: 202,
        success: false,
        message: "You cannot withdraw amount more than in your wallet",
      });
    } else {
      const withdrawal = await WithdrawalRequest.create(value);
      userWallet.amount = userWallet.amount - value.amount;

      await userWallet.save();

      return res.status(200).json({
        success: true,
        status: 200,
        data: withdrawal,
        message: "withdrawal request created successfully",
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
export const getAllWithdrawalReq = async (req: Request, res: Response) => {
  const { userId, status } = req.query;
  let query: any = {};
  const currentPage = Number(req?.query?.page) + 1 || 1;
  const currentDateTime = new Date();
  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  if (userId) {
    query.user = ObjectId(userId.toString());
  } else {
    // const uId = res.locals.user._id;
    // query.user = ObjectId(uId.toString());
  }
  if (status) {
    query.status = { $regex: status, $options: "i" };
  }
  try {
    const requests = await WithdrawalRequest.find(query)
      .populate("user", "firstName lastName phone countryCode email role")
      .populate("bank")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalCount = await WithdrawalRequest.countDocuments(query);
    return res.status(200).json({
      success: true,
      status: 200,
      data: requests,
      pagination: pagination(totalCount, currentPage, limit),
      message: "Withdrawal request fetched successfully",
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
export const updateWithDrawalReq = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const withdrawal: any = await WithdrawalRequest.findById(id);

    if (withdrawal?.status === status) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: `Withdrawal request is already ${status}`,
      });
    } else {
      withdrawal.status = status;
      const admin = await User.findOne({ role: "SUPER_ADMIN" });
      await createNotification(
        admin?._id,
        withdrawal.user,
        NoticationMessage.withDrawalApproved.title,
        NotificationType.Withdrawal,
        "web",
        NoticationMessage.withDrawalApproved.message,
        { targetId: withdrawal?._id },
        {}
      );
      // const wallet: any = await Wallet.findOne({ user: withdrawal.user });
      // wallet.amount = wallet.amount + withdrawal.amount;
      // await wallet.save();
      await createTransaction(
        withdrawal?.amount,
        "DEBIT",
        withdrawal?.user,
        admin?._id,
        "Withdraw",
        ObjectId(""),
        "WITHDRAWAL"
      );
      await withdrawal.save();
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: `withdrawal request has been successfully ${status}`,
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
export const payWithWallet = async (req: Request, res: Response) => {
  const { bookingId, userId } = req.body;
  const superAdminId = await getSuperAdminId();
  try {
    const booking: any = await BookingPayment.findOne({
      booking: ObjectId(bookingId.toString()),
    });
    if (booking.status === "PAID") {
      return res.status(201).json({
        status: 201,
        success: false,
        message: "Payment has been already done",
      });
    }
    let grandTotal = booking.grandTotal;
    console.log(grandTotal, "grandTotal");
    const userWallet: any = await Wallet.findOne({
      user: ObjectId(userId.toString()),
    });
    console.log(userWallet, "userWallet");
    if (userWallet?.amount >= grandTotal) {
      // console.log(grandTotal, "grandTotal")

      const transaction = await createTransaction(
        grandTotal,
        "DEBIT",
        userId,
        superAdminId,
        "Booking Payment",
        ObjectId(bookingId.toString())
      );
      console.log(transaction);
      booking.status = "PAID";
      const mainBooking: any = await Booking.findById(ObjectId(bookingId));
      mainBooking.status = "CONFIRMED";
      booking.paymentObj = transaction;
      await booking.save();
      await mainBooking.save();
      return res.status(200).json({
        status: 200,
        success: true,
        data: {
          isPaymentCompleted: true,
          transaction,
        },
        message: "payment successfull",
      });
    } else {
      let trans;
      if (userWallet.amount !== 0) {
        trans = await createTransaction(
          userWallet.amount,
          "DEBIT",
          userId,
          superAdminId,
          "Booking Payment",
          ObjectId(bookingId.toString())
        );
      }
      console.log(trans, "trans");
      return res.status(200).json({
        status: 200,
        success: true,
        data: {
          isPaymentCompleted: false,
          transaction: trans ? trans : null,
          remainingAmount: grandTotal - userWallet.amount,
        },
        message: "partial payment successfull",
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
