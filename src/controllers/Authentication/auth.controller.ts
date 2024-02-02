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
import { createTransaction, createWallet } from "../Wallet/wallet.controller";
// import { checkVerification, sendVerification } from "../../helper/smsService";
import Expert from "../../models/experts.model";
import { Roles } from "../../utils/role";
import { existsSync, unlinkSync } from "fs";
import { generateOtp, generateRandomNumber } from "../../helper/helper";
import { sendEmailfromSmtp } from "../../helper/mailService";
import { getSuperAdminId } from "../../helper/impFunctions";
import { Types } from "mongoose";

export const createNewUser = async (req: Request, res: Response) => {
  let data = req.body;

  let role = req?.body?.role;
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
  const userWithEmail = await User.findOne({
    email: value.email.toLowerCase(),
  });
  const userWithPhone = await User.findOne({ phone: value.phone });

  // if user exists
  if (userWithEmail && userWithPhone) {
    return res.status(200).json({
      status: 200,
      success: false,
      type: "error",
      message: "Both email and phone already exist",
    });
  } else if (userWithEmail) {
    return res.status(200).json({
      status: 200,
      success: false,
      type: "error",
      message: "Email already exists",
    });
  } else if (userWithPhone) {
    return res.status(200).json({
      status: 200,
      success: false,
      type: "error",
      message: "Phone already exists",
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
        role: value.role ? value.role : Roles.USER,
        password: hashedPassword,
        referBy: value.referBy ? value.referBy : null,
        countryCode: value.countryCode,
        termAndConditions: true,
      });
      // save
      const newUserWallet = await createWallet(newUser._id.toString());
      console.log(
        value.referBy && Types.ObjectId.isValid(value.referBy),
        "refer condition"
      );
      console.log(value.referBy, "referValue");
      console.log(Types.ObjectId.isValid(value.referBy), "referType");
      if (value.referBy && Types.ObjectId.isValid(value.referBy)) {
        const superAdminId = await getSuperAdminId();
        // bonus to new joinee
        const trans1 = await createTransaction(
          5,
          "CREDIT",
          newUser._id,
          superAdminId,
          "Referal Bonus"
        );
        // rewards to old user who refered to new joinee
        const trans2 = await createTransaction(
          5,
          "CREDIT",
          ObjectId(value.referBy),
          superAdminId,
          "Referal Bonus"
        );
        console.log(trans1, "trans1")
        console.log(trans2, "trans2")
      }
     
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

  let role = req?.body?.role;
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
        agencyName: value.agencyName,
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
          name: newUser.agencyName,
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
  let { email, password, role, appDeviceToken} = req.body;
  // check validation error using JOI
  const { error, value } = loginSchema.validate({ email, password, appDeviceToken });

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
    console.log(IsUserExist);
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
          phone,
          isExpertProfileVerified,
          isNewAccount,
          isFirstBookingDone,
          countryCode,
          showBookingGuide,
        } = IsUserExist;
        IsUserExist.appDeviceToken = appDeviceToken;
        await IsUserExist.save()
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
              phone,
              isNewAccount,
              isFirstBookingDone,
              role,
              isExpertProfileVerified,
              countryCode,
              showBookingGuide,
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
export const logOutApi = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userUpdate = await User.updateOne(
      { _id: ObjectId(userId) },
      { $set: { isNewAccount: false } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      message: "updation successfull",
    });
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

    if (user?.role === Roles.EXPERT) {
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
    const userData = await User.findOne(ObjectId(userId));
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
export const getUserProfileById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userData = await Expert.findOne({ user: ObjectId(userId) }).populate(
      "user jobCategory"
    );
    if (!userData) {
      return res.status(200).json({
        success: false,
        type: "error",
        status: 406,
        message: USER_NOT_FOUND_ERR,
      });
    }
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
  const { mobile, email, type, countryCode } = req.body;
  try {
    let query: any = {};
    if (type === "EMAIL" && email) {
      query.email = { $regex: email, $options: "i" };
    } else if (type === "PHONE" && mobile) {
      query.phone = mobile;
    }
    const checkUser = await User.findOne({
      $or: [query],
      isDeleted: false,
      // countryCode: countryCode,
    });

    // console.log(checkUser);
    if (!checkUser) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "User not found",
      });
    }
    if (type === "EMAIL") {
      const newOtp = generateOtp();
      const sendEmail = await sendEmailfromSmtp(
        email,
        "RESET PASSWORD",
        `Dear ${
          checkUser && checkUser?.firstName
            ? checkUser.firstName + " " + checkUser?.lastName
            : checkUser.agencyName
        },

      Your OTP for authentication is: ${newOtp}
      
      This OTP will expire in 15 Min. Please do not share it with anyone for security reasons.
      
      Thank you,
      Crack-IT`,
        { otp: newOtp }
      );
      checkUser.otp = newOtp;
      await checkUser.save();
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Otp sent successfully on your registered mail id",
      });
    }
    if (mobile && type === "PHONE") {
      // const\
      let sendSms;
      // const sendSms = await sendVerification(mobile, countryCode ? countryCode : null);
      // if (sendSms) console.log(sendSms);
      // check in response object whenver you will recieve the twilio credentials
      if (sendSms) {
        return res.status(200).json({
          success: true,
          status: 200,
          message: "Otp sent successfully",
        });
      } else {
        return res.status(203).json({
          success: false,
          status: 203,
          message: "Sending Sms failed",
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

export const forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { mobile, email, countryCode, otp, type } = req.body;
    let query: any = {};
    if (type === "EMAIL") {
      query.email = email;
    } else {
      query.phone = mobile;
      query.countryCode = countryCode;
    }
    const user = await User.findOne({
      ...query,
    });
    if (!user) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "User not found",
      });
    }
    // if (mobile && countryCode && otp) {
    //   // const verifyOtp = await checkVerification(countryCode, mobile, otp);
    //   console.log(typeof otp);
    //   const verifyOtp = {
    //     valid: otp == 123456 ? true : false,
    //   };
    //   if (verifyOtp && verifyOtp.valid) {
    //     const token = createJwtToken({ userId: user._id }, "1h");

    //     return res.status(200).json({
    //       success: true,
    //       status: 200,
    //       data: {
    //         token,
    //       },
    //       message: "Otp verified",
    //     });
    //   } else {
    //     return res.status(200).json({
    //       success: false,
    //       status: 203,
    //       message: "Invalid OTP",
    //     });
    //   }
    // }
    if (type === "EMAIL") {
      if (user.otp == otp) {
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
    // if(type==="PHONE"){

    // }
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

export const setProfilePicOfUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    if (req?.files) {
      var { profilePic }: any = req?.files;
      if (!profilePic) {
        return res.status(200).json({
          success: false,
          status: 206,
          message: "Profile pic is required",
        });
      }
      var media = profilePic[0]?.path?.replaceAll("\\", "/") || "";

      console.log(profilePic);

      console.log(ObjectId(userId.toString()), "id");

      const user = await User.findOneAndUpdate(
        { _id: ObjectId(userId.toString()) },
        {
          profilePhoto: media,
        }
      );
      if (user && user.profilePhoto) {
        profilePic &&
          existsSync(user.profilePhoto) &&
          unlinkSync(user.profilePhoto);
      }
      return res.status(200).json({
        success: true,
        status: 200,
        data: user,
        message: "Profile pic saved",
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

export const setAvatarProfilePicture = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  try {
    const setUsersAvatar: any = await User.findById(ObjectId(userId));
    if (!setUsersAvatar) {
      return res.status(200).json({
        status: 200,
        success: false,
        type: "error",
        message: "user not found",
      });
    }
    setUsersAvatar.profilePhoto = avatar;
    await setUsersAvatar.save();

    return res.status(200).json({
      success: true,
      status: 200,
      data: setUsersAvatar,
      message: "Profile pic saved",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
export const removeFirstLogger = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const dataUpdate = await User.findByIdAndUpdate(
      { _id: ObjectId(userId) },
      { $set: { isLoggedInFirstTime: false } }
    );

    return res.status(200).json({
      success: false,
      type: "success",
      data: dataUpdate,
      message: "Data updated ",
    });
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
// export const saveTimeZoneForUser = async
