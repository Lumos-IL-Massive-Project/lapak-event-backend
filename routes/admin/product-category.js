const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getProductCategoryDetails,
  createProductCategory,
  deleteProductCategory,
  updateProductCategory,
} = require("../../controllers/product-category");
const { uploadProductCategoryImage } = require("../../controllers/multer");

router.get("/:id", authAdmin, getProductCategoryDetails);
router.post(
  "/",
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("image")
      .notEmpty()
      .withMessage("Image harus diisi")
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Image harus berupa file");
        }

        return true;
      }),
  ],
  uploadProductCategoryImage.single("image"),
  createProductCategory
);
router.put(
  "/:id",
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("image")
      .notEmpty()
      .withMessage("Image harus diisi")
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Image harus berupa file");
        }

        return true;
      }),
  ],
  uploadProductCategoryImage.single("image"),
  updateProductCategory
);
router.delete("/:id", authAdmin, deleteProductCategory);

module.exports = router;
