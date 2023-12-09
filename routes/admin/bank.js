const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { uploadBankImage } = require("../../controllers/multer");
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
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("code").notEmpty().withMessage("Kode harus diisi"),
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
  uploadBankImage.single("image"),
  createBank
);
router.put(
  "/:id",
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("code").notEmpty().withMessage("Kode harus diisi"),
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
  uploadBankImage.single("image"),
  updateBank
);
router.delete("/:id", authAdmin, deleteBank);

module.exports = router;
