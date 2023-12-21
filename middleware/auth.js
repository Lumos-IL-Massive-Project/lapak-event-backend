const { validationResult, body } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { returnError } = require("../utils/throw-error");
const removeFile = require("../utils/remove-file");

const config = process.env;

const auth = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      removeFile(req.file?.path);
      returnError(res, errors.array()[0].msg, 400);
      return;
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";

        removeFile(req.file?.path);
        returnError(res, message, 401);
        return;
      }

      const [user] = await db
        .promise()
        .query("SELECT * FROM `users` WHERE email =? AND token=?", [
          payload.email,
          token,
        ]);

      if (!user.length) {
        removeFile(req.file?.path);
        returnError(res, "Unauthorized", 401);
        return;
      }

      req.body.user_id = user[0]?.id;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const authAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      removeFile(req.file?.path);
      returnError(res, errors.array()[0].msg, 400);
      return;
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";

        removeFile(req.file?.path);
        returnError(res, message, 401);
        return;
      }

      const [user] = await db
        .promise()
        .query(
          "SELECT `email`,`role`,`token` FROM `users` WHERE email =? AND role =? AND token=?",
          [payload.email, "admin", token]
        );

      if (!user.length) {
        removeFile(req.file?.path);
        returnError(res, "Unauthorized", 401);
        return;
      }

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkRegisteredEmailValidator = [
  body("email").notEmpty().withMessage("Email harus diisi!"),
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
];

const loginValidator = [
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
];

const registerValidator = [
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
];

const verifyOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email harus diisi!")
    .isEmail()
    .withMessage("Email harus berformat email"),
  body("otp").notEmpty().withMessage("OTP harus diisi!"),
];

const refreshOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email harus diisi!")
    .isEmail()
    .withMessage("Email harus berformat email"),
];

const refreshTokenValidator = [
  body("refresh_token").notEmpty().withMessage("Refresh token harus diisi"),
];

module.exports = {
  auth,
  authAdmin,
  checkRegisteredEmailValidator,
  loginValidator,
  registerValidator,
  verifyOtpValidator,
  refreshOtpValidator,
  refreshTokenValidator
};
