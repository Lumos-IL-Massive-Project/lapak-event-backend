const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getProvinceDetails,
  createProvince,
  updateProvince,
  deleteProvince,
} = require("../../controllers/province");

router.get("/:id", authAdmin, getProvinceDetails);
router.post(
  "/",
  authAdmin,
  [body("name").notEmpty().withMessage("Nama harus diisi")],
  createProvince
);
router.put(
  "/:id",
  authAdmin,
  [body("name").notEmpty().withMessage("Nama harus diisi")],
  updateProvince
);
router.delete("/:id", authAdmin, deleteProvince);

module.exports = router;
