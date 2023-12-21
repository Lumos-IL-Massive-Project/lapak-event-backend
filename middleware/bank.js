const { body } = require("express-validator");

const bankValidator = [
  body("name").notEmpty().withMessage("Nama harus diisi"),
  body("code").notEmpty().withMessage("Kode harus diisi"),
  body("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image harus berupa file");
    }

    return true;
  }),
];

module.exports = {
  bankValidator,
}