const { body } = require("express-validator");

const provinceValidator = [
  body("name").notEmpty().withMessage("Nama harus diisi"),
];

module.exports = {
  provinceValidator,
};
