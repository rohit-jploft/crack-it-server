import { Response, Request } from "express";
import Bank from "../../models/bank.model";
import { bankValidationSchema } from "../../schemas/wallet.schema";
import { ObjectId } from "../../helper/RequestHelper";

export const createBankDetails = async (req: Request, res: Response) => {
  try {
    // check validation error using JOI
    const { error, value } = bankValidationSchema.validate(req.body);

    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }

    const bank = new Bank(value);
    await bank.save();
    return res.status(200).json({
      success: true,
      status: 200,
      data: bank,
      message:
        value.type === "BANK"
          ? "Bank details added successfully"
          : "UPI Id added successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
export const getAllBankDetailsByUser = async (req: Request, res: Response) => {
  const { user, type } = req.query;
  let query: any = { isDeleted: false };
  if (user) {
    query.user = ObjectId(user.toString());
  }
  if (type) query.type = { $regex: type, $options: "i" };
  try {
    const details = await Bank.find(query);

    return res.status(200).json({
      success: true,
      status: 200,
      data: details,
      message: "Bank details fetched successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
