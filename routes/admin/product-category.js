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
const { uploadProductCategoryImage } = require("../../middleware/multer");

router.get("/:id", authAdmin, getProductCategoryDetails);
router.post(
  "/",
  uploadProductCategoryImage.single("image"),
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image harus berupa file");
      }

      return true;
    }),
  ],
  createProductCategory
);
router.put(
  "/:id",
  uploadProductCategoryImage.single("image"),
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image harus berupa file");
      }

      return true;
    }),
  ],
  updateProductCategory
);
router.delete("/:id", authAdmin, deleteProductCategory);

module.exports = router;
