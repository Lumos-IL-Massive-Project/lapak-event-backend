const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { returnError } = require("../utils/throw-error");

const config = process.env;

const auth = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      returnError(res, errors.array()[0].msg, 400);
      return;
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";
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

const authAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      returnError(res, errors.array()[0].msg, 400);
      return;
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";
        returnError(res, message, 401);
        return;
      }

      const [user] = await db
        .promise()
        .query("SELECT * FROM `users` WHERE email =? AND role =? AND token=?", [
          payload.email,
          "admin",
          token,
        ]);

      if (!user.length) {
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

module.exports = { auth, authAdmin };
