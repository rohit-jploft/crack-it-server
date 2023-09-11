// import twilio from 'twilio';
// import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SERVICE_SID } from './constant';

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// // Send verification
// const sendVerification = async ( number: string): Promise<string> => {
//   const verification = await client.verify.v2
//     .services(TWILIO_VERIFICATION_SERVICE_SID)
//     .verifications.create({ to: `+91${number}`, channel: 'sms'});
  
//   return verification.status;
// };

// // Check verification token
// const checkVerification = async ( number: string, Otpcode: string): Promise<any> => {
//   const verify = await client.verify.v2
//     .services(TWILIO_VERIFICATION_SERVICE_SID)
//     .verificationChecks.create({ to: `+91${number}`, code: Otpcode });
  
//   return JSON.parse(JSON.stringify(verify));
// };

// export {
//   sendVerification,
//   checkVerification
// };
