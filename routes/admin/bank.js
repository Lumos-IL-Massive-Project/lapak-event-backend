const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { uploadBankImage } = require("../../middleware/multer");
const {
  getBankDetails,
  createBank,
  deleteBank,
  updateBank,
} = require("../../controllers/bank");
const { authAdmin } = require("../../middleware/auth");

router.get("/:id", authAdmin, getBankDetails);
router.post(
  "/",
  uploadBankImage.single("image"),
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("code").notEmpty().withMessage("Kode harus diisi"),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image harus berupa file");
      }

      return true;
    }),
  ],
  createBank
);
router.put(
  "/:id",
  uploadBankImage.single("image"),
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("code").notEmpty().withMessage("Kode harus diisi"),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image harus berupa file");
      }

      return true;
    }),
  ],
  updateBank
);
router.delete("/:id", authAdmin, deleteBank);

module.exports = router;
