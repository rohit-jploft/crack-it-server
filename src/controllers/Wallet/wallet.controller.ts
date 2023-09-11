import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import Wallet from "../../models/wallet.model";

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
