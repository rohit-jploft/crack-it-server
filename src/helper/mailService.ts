import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// Create a transporter using SMTP details from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "465", 10),
  secure: process.env.MAIL_ENCRYPTION === "ssl",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendEmailfromSmtp = async (
  recipient: string,
  subject: string,
  body: string
) => {
  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: recipient, // Replace with the recipient's email address
    subject: subject,
    text: body,
  };
  var res: any = {};
  // Send email
  //   const emailResponse =  transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       console.error("Error occurred while sending email:", error.message);
  //       res.success =  false;
  //       res.error =  error.message;
  //       console.log("hello")
  //       return true
  //     } else {
  //       console.log("Email sent successfully!");
  //       console.log("Message ID:", info.messageId);
  //         res.success = true;
  //         res.error = null;
  //         return false
  //     }
  //   });..
  const emailResponse = await transporter.sendMail(mailOptions);
  console.log(emailResponse, "res");
  if (emailResponse && emailResponse.messageId) {
    return { success: true, error: null };
  } else {
    return {success:false, error:"Something went wrong"}
  }

};
// Email content
