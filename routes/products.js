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
const { body } = require("express-validator");
const { uploadProductImages } = require("../middleware/multer");

router.get("/", auth, getAllProducts);
router.get("/:id", auth, getProductDetails);
router.post(
  "/",
  auth,
  [
    body("user_id").notEmpty().withMessage("ID User tidak boleh kosong!"),
    body("category_id").notEmpty().withMessage("Kategori harus dipilih!"),
    body("name").notEmpty().withMessage("Nama produk harus diisi!"),
    body("price").notEmpty().withMessage("Harga harus diisi!"),
    body("description").notEmpty().withMessage("Deskripsi produk harus diisi!"),
    body("images.*.id").notEmpty().withMessage("ID gambar tidak boleh kosong!"),
    body("images.*.url").notEmpty().withMessage("Gambar harus dipilih!"),
  ],
  createProduct
);
router.put(
  "/:id",
  auth,
  [
    body("user_id").notEmpty().withMessage("ID User tidak boleh kosong!"),
    body("category_id").notEmpty().withMessage("Kategori harus dipilih!"),
    body("name").notEmpty().withMessage("Nama produk harus diisi!"),
    body("price").notEmpty().withMessage("Harga harus diisi!"),
    body("description").notEmpty().withMessage("Deskripsi produk harus diisi!"),
    body("images.*.id").notEmpty().withMessage("ID gambar tidak boleh kosong!"),
    body("images.*.url").notEmpty().withMessage("Gambar harus dipilih!"),
  ],
  updateProduct
);
router.delete("/:id", auth, deleteProduct);

router.post(
  "/temp-image",
  uploadProductImages.single("image"),
  auth,
  [
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Gambar tidak boleh kosong!");
      }

      return true;
    }),
  ],
  uploadTemporaryImage
);
router.delete("/temp-image/:id", auth, deleteProductImage);

module.exports = router;
