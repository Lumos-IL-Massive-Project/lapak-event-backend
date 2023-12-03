const express = require("express");
const {
  login,
  checkRegisteredEmail,
  register,
  verifyOTP,
  refreshOTP,
} = require("../controllers/auth");
const { body } = require("express-validator");
const router = express.Router();

router.post(
  "/check-email",
  [body("email").notEmpty().withMessage("Email harus diisi!")],
  checkRegisteredEmail
);
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email harus diisi!")
      .isEmail()
      .withMessage("Email harus berformat email"),
    body("password").notEmpty().withMessage("Password harus diisi!"),
  ],
  login
);
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username harus diisi!"),
    body("email")
      .notEmpty()
      .withMessage("Email harus diisi!")
      .isEmail()
      .withMessage("Email harus berformat email"),
    body("phone_number").notEmpty().withMessage("Nomor hp harus diisi!"),
    body("password")
      .notEmpty()
      .withMessage("Password harus diisi!")
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter"),
    body("confirmation_password")
      .notEmpty()
      .withMessage("Konfirmasi password harus diisi!")
      .isLength({ min: 8 })
      .withMessage("Konfirmasi password minimal 8 karakter"),
  ],
  register
);
router.post(
  "/verify-otp",
  [
    body("email")
      .notEmpty()
      .withMessage("Email harus diisi!")
      .isEmail()
      .withMessage("Email harus berformat email"),
    body("otp")
      .notEmpty()
      .withMessage("OTP harus diisi!")
      .isNumeric()
      .withMessage("OTP harus berformat angka"),
  ],
  verifyOTP
);
router.post(
  "/refresh-otp",
  [
    body("email")
      .notEmpty()
      .withMessage("Email harus diisi!")
      .isEmail()
      .withMessage("Email harus berformat email"),
  ],
  refreshOTP
);

module.exports = router;
