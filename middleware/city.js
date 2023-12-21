const { body } = require("express-validator");

const cityValidator = [
  body("name").notEmpty().withMessage("Nama kota harus diisi!"),
  body("province_id").notEmpty().withMessage("Provinsi harus diisi!"),
  body("type")
    .notEmpty()
    .withMessage("Jenis kota harus diisi!")
    .custom((value, { req }) => {
      const allowedType = ["city", "district"];

      if (!allowedType.includes(value)) {
        throw new Error("Jenis kota tidak valid");
      }

      return true;
    }),
  body("postal_code").notEmpty().withMessage("Kode pos harus diisi!"),
];

module.exports = {
  cityValidator,
}