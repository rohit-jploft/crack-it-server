// import twilio from "twilio";
// // import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SERVICE_SID } from './constant';

// const {
//   TWILIO_ACCOUNT_SID,
//   TWILIO_AUTH_TOKEN,
//   TWILIO_VERIFICATION_SERVICE_SID,
// }: any = process.env;

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// // Send verification
// const sendVerification = async (
//   number: string,
//   countryCode: string
// ): Promise<string> => {
//   const verification = await client.verify.v2
//     .services(TWILIO_VERIFICATION_SERVICE_SID)
//     .verifications.create({ to: `+${number}`, channel: "sms" });
//   console.log(verification);
//   return verification.status;
// };

// // Check verification token
// const checkVerification = async (
//   countryCode: string,
//   number: string,
//   Otpcode: string
// ): Promise<any> => {
//   const verify = await client.verify.v2
//     .services(TWILIO_VERIFICATION_SERVICE_SID)
//     .verificationChecks.create({
//       to: `${countryCode}${number}`,
//       code: Otpcode,
//     });

//   return JSON.parse(JSON.stringify(verify));
// };

// export { sendVerification, checkVerification };
