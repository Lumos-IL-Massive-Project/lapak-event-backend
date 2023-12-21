const express = require("express");
const router = express.Router();
const { uploadBankImage } = require("../../middleware/multer");
const {
  getBankDetails,
  createBank,
  deleteBank,
  updateBank,
} = require("../../controllers/bank");
const { authAdmin } = require("../../middleware/auth");
const { bankValidator } = require("../../middleware/bank");

router.get("/:id", authAdmin, getBankDetails);
router.post(
  "/",
  uploadBankImage.single("image"),
  authAdmin,
  bankValidator,
  createBank
);
router.put(
  "/:id",
  uploadBankImage.single("image"),
  authAdmin,
  bankValidator,
  updateBank
);
router.delete("/:id", authAdmin, deleteBank);

module.exports = router;
