const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const config = process.env;

const auth = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const token = req.headers?.["authorization"]?.split(' ')?.[1];
  jwt.verify(token, config.TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : "Token expired";
      return res.status(401).json({
        success: false,
        message: message,
      });
    }

    return next();
  });
}

module.exports = { auth }