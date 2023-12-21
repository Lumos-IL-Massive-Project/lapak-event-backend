const { body } = require("express-validator");

const createUserValidator = [
  body("username").notEmpty().withMessage("Username harus diisi!"),
  body("email")
    .notEmpty()
    .withMessage("Email harus diisi!")
    .isEmail()
    .withMessage("Email harus berformat email"),
  body("phone_number").notEmpty().withMessage("Nomor hp harus diisi!"),
  body("role")
    .notEmpty()
    .withMessage("Role harus diisi!")
    .custom((value, { req }) => {
      const allowedRoles = ["user", "admin", "event organizer"];

      if (!allowedRoles.includes(value)) {
        throw new Error("Role tidak valid");
      }

      return true;
    }),
  body("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image harus berupa file");
    }

    return true;
  }),
];

const updateUserValidator = [
  body("username").notEmpty().withMessage("Username harus diisi!"),
  body("phone_number").notEmpty().withMessage("Nomor hp harus diisi!"),
  body("role")
    .notEmpty()
    .withMessage("Role harus diisi!")
    .custom((value, { req }) => {
      const allowedRoles = ["user", "admin", "event organizer"];

      if (!allowedRoles.includes(value)) {
        throw new Error("Role tidak valid");
      }

      return true;
    }),
  body("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image harus berupa file");
    }

    return true;
  }),
]

module.exports = {
  createUserValidator,
  updateUserValidator,
}