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
  authMethod: 'PLAIN',
});


export const sendEmailfromSmtp = async (
  recipient: string,
  subject: string,
  body?: string,
  data?:any
) => {
  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: recipient, // Replace with the recipient's email address
    subject: subject,
    text: body,
    html:`
    <html>
    <head>
        <style>
            /* Add CSS styles for your email */
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .otp {
                text-align: center;
                font-size: 24px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src=${`https://v5.checkprojectstatus.com:4000/uploads/logo.png`} alt="Company Logo">
            </div>
            <div class="otp">
                <p>Your OTP for verification is: <strong>${data?.otp}</strong></p>
            </div>
        </div>
    </body>
    </html>
`
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
