const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const express = require("express");
const ejs = require("ejs");
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

const sendOTPEmail = ({ otpCode, username, emailDestination }) => {
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
    console.log("sendOTPEmail", error);
  }
};

const sendUserLoginCredentialEmail = ({ emailDestination, password }) => {
  try {
    const emailTemplatePath = path.join(
      emailTemplateFolder,
      "new-user/index.html"
    );
    const newUserTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: emailDestination,
      subject: "Welcome to Lapak Event",
      html: newUserTemplate
        .replace("{{email}}", emailDestination)
        .replace("{{password}}", password),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log("sendUserLoginCredentialEmail", error);
  }
};

const sendEventOrganizerApprovalEmail = ({ emailDestination, status, rejectionReasons }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: emailDestination,
      subject: "Konfirmasi Pendaftaran Event Organizer Lapak Event",
    };

    if (status === "approved") {
      const registrationApprovedTemplate = fs.readFileSync(
        path.join(emailTemplateFolder, "eo-registration-approved/index.html"),
        "utf-8"
      );

      mailOptions.html = registrationApprovedTemplate;
    } else {
      const registrationRejectedTemplate = fs.readFileSync(
        path.join(emailTemplateFolder, "eo-registration-rejected/index.ejs"),
        "utf-8"
      );

      const renderedTemplate = ejs.render(registrationRejectedTemplate, {
        reasons: rejectionReasons,
      });

      mailOptions.html = renderedTemplate;
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log("sendEventOrganizerApproval", error);
  }
};

module.exports = {
  sendOTPEmail,
  sendUserLoginCredentialEmail,
  sendEventOrganizerApprovalEmail,
};
