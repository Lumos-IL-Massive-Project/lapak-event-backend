const express = require("express");
const { login, checkRegisteredEmail } = require("../controllers/auth");
const { body } = require("express-validator");
const router = express.Router();

router.post(
  "/check-email",
  [body("email").notEmpty().withMessage("Email harus diisi!")],
  checkRegisteredEmail
);
router.get("/login", login);

module.exports = router;
