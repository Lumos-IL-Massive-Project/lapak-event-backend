const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllProducts,
  getProductDetails,
  createProduct,
  uploadTemporaryImage,
  updateProduct,
  deleteProductImage,
  deleteProduct,
} = require("../controllers/product");
const { uploadProductImages } = require("../middleware/multer");
const {
  createProductValidator,
  tempProductImageValidator,
} = require("../middleware/product");

router.get("/", auth, getAllProducts);
router.get("/:id", auth, getProductDetails);
router.post("/", auth, createProductValidator, createProduct);
router.put("/:id", auth, createProductValidator, updateProduct);
router.delete("/:id", auth, deleteProduct);

router.post(
  "/temp-image",
  uploadProductImages.single("image"),
  auth,
  tempProductImageValidator,
  uploadTemporaryImage
);
router.delete("/temp-image/:id", auth, deleteProductImage);

module.exports = router;
