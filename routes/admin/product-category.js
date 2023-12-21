const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getProductCategoryDetails,
  createProductCategory,
  deleteProductCategory,
  updateProductCategory,
  uploadCategoryThumbnail,
  uploadCategoryMenuImage,
} = require("../../controllers/product-category");
const { uploadProductCategoryImage } = require("../../middleware/multer");
const {
  createProductCategoryValidator,
  uploadThumbnailValidator,
  uploadMenuImageValidator,
} = require("../../middleware/product-category");

router.get("/:id", authAdmin, getProductCategoryDetails);
router.post(
  "/",
  authAdmin,
  createProductCategoryValidator,
  createProductCategory
);
router.post(
  "/thumbnail",
  uploadProductCategoryImage.single("thumbnail"),
  authAdmin,
  uploadThumbnailValidator,
  uploadCategoryThumbnail
);
router.post(
  "/menu-image",
  uploadProductCategoryImage.single("menu"),
  authAdmin,
  uploadMenuImageValidator,
  uploadCategoryMenuImage
);
router.put(
  "/:id",
  authAdmin,
  createProductCategoryValidator,
  updateProductCategory
);
router.delete("/:id", authAdmin, deleteProductCategory);

module.exports = router;
