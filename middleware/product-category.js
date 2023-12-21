const { body } = require("express-validator");

const createProductCategoryValidator = [
  body("name").notEmpty().withMessage("Nama harus diisi"),
  body("code").notEmpty().withMessage("Kode harus diisi"),
  body("thumbnail_url").notEmpty().withMessage("Gambar thumbnail harus diisi"),
  body("is_menu")
    .notEmpty()
    .withMessage("Opsi menu harus dipilih")
    .custom((value, { req }) => {
      console.log(value, typeof value);
      if (typeof value !== "boolean") {
        throw new Error("Menu harus boolean");
      }

      return true;
    }),
  body("menu_url").custom((value, { req }) => {
    if (req.body.is_menu && !value) {
      throw new Error("Gambar menu harus diisi");
    }

    return true;
  }),
];

const uploadThumbnailValidator = [
  body("thumbnail").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Thumbnail harus berupa file");
    }

    return true;
  }),
];

const uploadMenuImageValidator = [
  body("menu").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Gambar menu harus berupa file");
    }

    return true;
  }),
];

module.exports = {
  createProductCategoryValidator,
  uploadThumbnailValidator,
  uploadMenuImageValidator,
};
