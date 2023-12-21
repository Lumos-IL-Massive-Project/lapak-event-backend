const express = require("express");
const {
  login,
  checkRegisteredEmail,
  register,
  verifyOTP,
  refreshOTP,
  refreshToken,
} = require("../controllers/auth");
const {
  checkRegisteredEmailValidator,
  loginValidator,
  registerValidator,
  verifyOtpValidator,
  refreshTokenValidator,
  refreshOtpValidator,
} = require("../middleware/auth");
const router = express.Router();

router.post(
  "/check-email",
  checkRegisteredEmailValidator,
  checkRegisteredEmail
);
router.post("/login", loginValidator, login);
router.post("/register", registerValidator, register);
router.post("/verify-otp", verifyOtpValidator, verifyOTP);
router.post("/refresh-otp", refreshOtpValidator, refreshOTP);
router.put("/refresh-token/:id", refreshTokenValidator, refreshToken);

module.exports = router;
