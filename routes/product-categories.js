const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllProductCategories,
  getProductCategoryDetails,
  createProductCategory,
  deleteProductCategory,
} = require("../controllers/product-category");
const { uploadProductCategoryImage } = require("../controllers/multer");

router.get("/", auth, getAllProductCategories);
router.get("/:id", auth, getProductCategoryDetails);
router.post(
  "/",
  auth,
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
router.delete("/:id", auth, deleteProductCategory);

module.exports = router;
