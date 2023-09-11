import { Response, Request, NextFunction, Errback } from "express";
import { loginSchema, signupSchema } from "../../schemas/auth.shema";
import User from "../../models/user.model";
import * as bcrypt from "bcrypt";
import {
  INCORRECT_PASSWORD,
  USER_ALREADY_EXISTS,
  USER_NOT_FOUND_ERR,
} from "../../utils/error";
import { createJwtToken } from "../../utils/token.util";
import { ObjectId } from "../../helper/RequestHelper";
import { createWallet } from "../Wallet/wallet.controller";

export const createNewUser = async (req: Request, res: Response) => {
  let data = req.body;
  // check validation error using JOI
  const { error, value } = signupSchema.validate(data);

  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  // check user exists or not
  const IsUserExist = await User.findOne({ email: value.email });

  // if user exists
  if (IsUserExist) {
    return res.status(404).json({
      type: "error",
      message: USER_ALREADY_EXISTS,
    });
  } else {
    // if user does not exist in our database
    // then create a new user in db
    const hashedPassword = await bcrypt.hash(value.password, 12);
    try {
      const newUser = await User.create({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        phone: value.phone,
        role: value.role ? value.role : "USER",
        password: hashedPassword,
        countryCode: value.countryCode,
        termAndConditions: true,
      });
      // save
      await createWallet(newUser._id.toString());
      // return the success response for account creation
      return res.status(200).json({
        type: "success",
        status: 200,
        message: "Account created successfully",
        data: {
          userId: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });
    } catch (error: any) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  // check validation error using JOI
  const { error, value } = loginSchema.validate({ email, password });

  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  try {
    // check user exists or not
    var IsUserExist = await User.findOne({
      email: { $regex: value.email, $options: "i" },
    });
    if (IsUserExist?.isDeleted) {
      return res.status(306).json({
        success: false,
        status: 306,
        message: "Account is suspended",
      });
    }

    if (!IsUserExist) {
      return res.status(404).json({
        success: false,
        status: 403,
        message: USER_NOT_FOUND_ERR,
      });
    } else {
      const doMatch = await bcrypt.compare(password, IsUserExist.password);
      if (doMatch) {
        const token = createJwtToken({ userId: IsUserExist._id });
        const { firstName, lastName, email, _id } = IsUserExist;
        const response = {
          success: true,
          status: 200,
          data: {
            token: token,
            user: {
              _id,
              firstName,
              lastName,
              email,
            },
          },
          message: "Login SuccessFully",
        };
        return res.status(200).json(response);
      } else {
        return res
          .status(403)
          .json({ statusCode: 401, message: INCORRECT_PASSWORD });
      }
    }
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const tempDeleteUser = await User.findOneAndUpdate(
      ObjectId(userId),
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Account Deleted successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
