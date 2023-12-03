const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const express = require("express");
require("dotenv").config();

const app = express();

const emailTemplateFolder = path.join(__dirname, "../email-templates");
app.use(express.static(emailTemplateFolder));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASSWORD_EMAIL_SENDER,
  },
});

const sendOTP = ({ otpCode, username, emailDestination }) => {
  try {
    const emailTemplatePath = path.join(emailTemplateFolder, "otp/index.html");
    const otpTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: emailDestination,
      subject: "Welcome to Lapak Event - OTP Verification Register",
      html: otpTemplate
        .replace("{{otpCode}}", otpCode)
        .replace("{{username}}", username),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log("sendOTP", error);
  }
};

module.exports = {
  sendOTP,
};
