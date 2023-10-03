import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import Wallet from "../../models/wallet.model";
import withdrawalRequestSchema from "../../schemas/wallet.schema";
import WithdrawalRequest from "../../models/withdrawal.model";
import { Types } from "mongoose";
import WalletTransaction from "../../models/walletTransactions.model";
import { pagination } from "../../helper/pagination";

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
  otherUser: Types.ObjectId
) => {
  try {
    // Ensure that user and otherUser exist and are valid ObjectId strings
    if (!Types.ObjectId.isValid(user) || !Types.ObjectId.isValid(otherUser)) {
      return { type: "error", message: "Invalid IDs" };
    }

    // Check the user's wallet balance
    const userWallet = await Wallet.findOne({ user });

    if (!userWallet) {
      return { type: "error", message: "User wallet not found" };
    }

    // Check the otherUser's wallet balance (only for CREDIT transactions)
    if (type === "CREDIT") {
      const otherUserWallet = await Wallet.findOne({ user: otherUser });

      if (!otherUserWallet) {
        return { type: "error", message: "Other user wallet not found" };
      }

      if (otherUserWallet.amount < amount) {
        return { type: "error", message: "Other user has insufficient funds" };
      }
      otherUserWallet.amount -= amount;
    }

    // Create a new wallet transaction for the user
    const userTransaction = new WalletTransaction({
      amount,
      type,
      user,
      otherUser,
    });

    // Create a new wallet transaction for the otherUser (reverse type)
    const otherUserTransaction = new WalletTransaction({
      amount,
      type: type === "CREDIT" ? "DEBIT" : "CREDIT",
      user: otherUser,
      otherUser: user,
    });

    // Save both transactions
    await userTransaction.save();
    await otherUserTransaction.save();

    // Update the user's wallet balance based on the transaction type
    if (type === "CREDIT") {
      userWallet.amount += amount;
    } else if (type === "DEBIT") {
      userWallet.amount -= amount;
    }

    // Save the updated user wallet balance
    await userWallet.save();

    return { userTransaction, otherUserTransaction };
  } catch (error) {
    return { message: "Server error", type: "error" };
  }
};
export const getUsersTransaction = async (req: Request, res: Response) => {
  const currentPage = Number(req?.query?.page) + 1 || 1;

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
      .populate("user", "firstName lastName")
      .populate("otherUser", "firstName lastName");
    const wallet = await createWallet(userId);
    res.status(200).json({
      success: true,
      type: "success",
      data: { wallet: wallet, transactions },
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
    const withdrawal = await WithdrawalRequest.create(value);

    return res.status(200).json({
      success: true,
      status: 200,
      data: withdrawal,
      message: "withdrawal request created successfully",
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
export const getAllWithdrawalReq = async (req: Request, res: Response) => {
  const { userId, status } = req.query;
  let query: any = {};
  const currentPage = Number(req?.query?.page) + 1 || 1;
  const currentDateTime = new Date();
  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  if (userId) {
    query.user = ObjectId(userId.toString());
  }
  if (status) {
    query.status = {$regex:status, $options:'i'};
  }
  try {
    const requests = await WithdrawalRequest.find(query)
      .populate("user", "firstName lastName phone countryCode email")
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
