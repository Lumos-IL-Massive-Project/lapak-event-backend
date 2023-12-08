const express = require("express");
const {
  login,
  checkRegisteredEmail,
  register,
  verifyOTP,
  refreshOTP,
  refreshToken,
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
    body("platform")
      .notEmpty()
      .withMessage("Platform harus diisi!")
      .custom((value, { req }) => {
        const allowedPlatforms = ["mobile", "web"];

        if (!allowedPlatforms.includes(value)) {
          throw new Error("Platform tidak valid");
        }

        return true;
      }),
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
    body("otp").notEmpty().withMessage("OTP harus diisi!"),
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
router.put(
  "/refresh-token/:id",
  [body("refresh_token").notEmpty().withMessage("Refresh token harus diisi")],
  refreshToken
);

module.exports = router;
