const { body } = require("express-validator");

const createProductValidator = [
  body("user_id").notEmpty().withMessage("ID User tidak boleh kosong!"),
  body("category_id").notEmpty().withMessage("Kategori harus dipilih!"),
  body("name").notEmpty().withMessage("Nama produk harus diisi!"),
  body("price").notEmpty().withMessage("Harga harus diisi!"),
  body("description").notEmpty().withMessage("Deskripsi produk harus diisi!"),
  body("images.*.id").notEmpty().withMessage("ID gambar tidak boleh kosong!"),
  body("images.*.url").notEmpty().withMessage("Gambar harus dipilih!"),
];

const tempProductImageValidator = [
  body("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Gambar tidak boleh kosong!");
    }

    return true;
  }),
];

module.exports = {
  createProductValidator,
  tempProductImageValidator,
};
