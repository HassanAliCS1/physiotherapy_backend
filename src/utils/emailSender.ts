import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_SERVER_EMAIL,
    pass: process.env.MAIL_SERVER_PASSWORD,
  },
});

export const sendEmailVerificationLink = async (
  first_name: string,
  email: string,
  token: string
) => {
  const port = process.env.PORT || 3000;
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_BASE_URL
      : `http://localhost:${port}`;

  const mailOptions = {
    from: process.env.MAIL_SERVER_EMAIL,
    to: email,
    subject: "Email Verification",
    text: `Hi ${first_name},\n\n Click on the link to verify your email ${baseUrl}/api/auth/verify-email/${token}`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
  });
};

export const sendForgotPasswordOtp = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.MAIL_SERVER_EMAIL,
    to: email,
    subject: "Reset Password",
    text: `Your OTP to reset password is ${otp}`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
  });
};
