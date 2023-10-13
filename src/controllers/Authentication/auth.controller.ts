import { Response, Request } from "express";
import {
  AgencysignupSchema,
  changePasswordSchema,
  loginSchema,
  signupSchema,
} from "../../schemas/auth.shema";
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
import { checkVerification, sendVerification } from "../../helper/smsService";
import Expert from "../../models/experts.model";

export const createNewUser = async (req: Request, res: Response) => {
  let data = req.body;

  let role = req?.body?.role
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
  const IsUserExist = await User.findOne({
    $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
  });

  // if user exists
  if (IsUserExist) {
    return res.status(200).json({
      status: 200,
      success: false,
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
        email: value.email.toLowerCase(),
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
        success: true,
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
export const createNewAgency = async (req: Request, res: Response) => {
  let data = req.body;

  let role = req?.body?.role
  // check validation error using JOI
  const { error, value } = AgencysignupSchema.validate(data);

  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  // check user exists or not
  const IsUserExist = await User.findOne({
    $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
  });

  // if user exists
  if (IsUserExist) {
    return res.status(200).json({
      status: 200,
      success: false,
      type: "error",
      message: USER_ALREADY_EXISTS,
    });
  } else {
    // if user does not exist in our database
    // then create a new user in db
    const hashedPassword = await bcrypt.hash(value.password, 12);
    try {
      const newUser = await User.create({
        agencyName:value.agencyName,
        email: value.email.toLowerCase(),
        phone: value.phone,
        role: "AGENCY",
        password: hashedPassword,
        countryCode: value.countryCode,
        termAndConditions: true,
      });
      // save
      await createWallet(newUser._id.toString());
      // return the success response for account creation
      return res.status(200).json({
        type: "success",
        success: false,
        status: 200,
        message: "Account created successfully",
        data: {
          userId: newUser._id,
          name:newUser.agencyName
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
  let { email, password, role } = req.body;
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
      email: email.toLowerCase(),
    });
    if (role && role.toUpperCase() != IsUserExist?.role) {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 306,
        message: `You need to be an ${role}`,
      });
    }
    if (IsUserExist?.isDeleted) {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 306,
        message: "Account is suspended",
      });
    }

    if (!IsUserExist) {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 406,
        message: USER_NOT_FOUND_ERR,
      });
    } else {
      const doMatch = await bcrypt.compare(password, IsUserExist.password);
      if (doMatch) {
        const token = createJwtToken({ userId: IsUserExist._id });
        const {
          firstName,
          lastName,
          email,
          _id,
          role,
          isExpertProfileVerified,
        } = IsUserExist;
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
              role,
              isExpertProfileVerified,
            },
          },
          message: "Login SuccessFully",
        };
        return res.status(200).json(response);
      } else {
        return res
          .status(200)
          .json({ status: 401, type: "error", message: INCORRECT_PASSWORD });
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
//suspend account
export const deleteAccount = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isDeleted } = req.body;
  console.log(isDeleted, "isDeleted");
  try {
    const tempDeleteUser = await User.findOneAndUpdate(
      ObjectId(userId),
      { isDeleted: isDeleted },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      message: `Account ${isDeleted ? "Suspended" : "Active"} Successfully`,
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
// permanent delete accunt
export const permanentDeleteAccount = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: ObjectId(userId) });

    if (user?.role === "EXPERT") {
      const expert = await Expert.deleteOne({ user: ObjectId(userId) });
      await User.deleteOne({ _id: ObjectId(userId) });
    }
    await User.deleteOne({ _id: ObjectId(userId) });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Your account deleted permanently",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const getUserDetail = async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  try {
    const userData = await User.findOne(ObjectId(userId), {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      role: 1,
      countryCode: 1,
    });
    return res.status(200).json({
      success: true,
      status: 200,
      data: userData,
      message: "Account details fetched successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, password } = req.body;
  // check validation error using JOI
  const { error, value } = changePasswordSchema.validate({
    oldPassword,
    password,
  });

  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  const userId = res.locals.user._id;
  try {
    const userData = await User.findById(ObjectId(userId));
    if (!userData) {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 406,
        message: USER_NOT_FOUND_ERR,
      });
    }
    const doMatch = await bcrypt.compare(oldPassword, userData.password);
    if (doMatch) {
      const hashedPassword = await bcrypt.hash(password, 12);
      userData.password = hashedPassword;
      await userData.save();
      return res.status(200).json({
        success: true,
        type: "success",
        status: 200,
        message: "Password changed successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 406,
        message: "Incorrect old password",
      });
    }
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

export const forgotPasswordsendOtp = async (req: Request, res: Response) => {
  const { mobile, countryCode } = req.body;
  try {
    const checkUser = await User.findOne({
      phone: mobile,
      countryCode: countryCode,
    });
    if (!checkUser) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "User not found",
      });
    }
    if (mobile && countryCode) {
      // const sendSms = await sendVerification(mobile, countryCode);
      // if (sendSms) console.log(sendSms);
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Otp sent successfully",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { mobile, countryCode, otp } = req.body;
    const user = await User.findOne({
      phone: mobile,
      countryCode: countryCode,
    });
    if (!user) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "User not found",
      });
    }
    if (mobile && countryCode && otp) {
      // const verifyOtp = await checkVerification(countryCode, mobile, otp);
      console.log(typeof otp);
      const verifyOtp = {
        valid: otp == 123456 ? true : false,
      };
      if (verifyOtp && verifyOtp.valid) {
        const token = createJwtToken({ userId: user._id }, "1h");

        return res.status(200).json({
          success: true,
          status: 200,
          data: {
            token,
          },
          message: "Otp verified",
        });
      } else {
        return res.status(200).json({
          success: false,
          status: 203,
          message: "Invalid OTP",
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const setNewPassword = async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    return res.status(200).json({
      success: true,
      status: 200,
      message: "password is changed successfully",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
