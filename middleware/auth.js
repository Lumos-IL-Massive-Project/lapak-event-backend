const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const config = process.env;

const auth = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";
        return res.status(401).json({
          success: false,
          message: message,
        });
      }

      const [user] = await db
        .promise()
        .query("SELECT * FROM `users` WHERE email =? AND token=?", [
          payload.email,
          token,
        ]);

      if (!user.length) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      return next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: message,
    });
  }
};

const authAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const token = req.headers?.["authorization"]?.split(" ")?.[1];
    jwt.verify(token, config.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";
        return res.status(401).json({
          success: false,
          message: message,
        });
      }

      const [user] = await db
        .promise()
        .query("SELECT * FROM `users` WHERE email =? AND role =? AND token=?", [
          payload.email,
          "admin",
          token,
        ]);

      if (!user.length) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      return next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: message,
    });
  }
};

module.exports = { auth, authAdmin };
