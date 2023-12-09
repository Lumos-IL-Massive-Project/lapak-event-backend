const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { uploadBankImage } = require("../controllers/multer");
const {
  getAllBanks,
  getBankDetails,
  createBank,
  deleteBank,
  updateBank,
} = require("../controllers/bank");

router.get("/", auth, getAllBanks);
router.get("/:id", auth, getBankDetails);
router.post(
  "/",
  auth,
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
  auth,
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
router.delete("/:id", auth, deleteBank);

module.exports = router;
