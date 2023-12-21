const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getProvinceDetails,
  createProvince,
  updateProvince,
  deleteProvince,
} = require("../../controllers/province");
const { provinceValidator } = require("../../middleware/province");

router.get("/:id", authAdmin, getProvinceDetails);
router.post("/", authAdmin, provinceValidator, createProvince);
router.put("/:id", authAdmin, provinceValidator, updateProvince);
router.delete("/:id", authAdmin, deleteProvince);

module.exports = router;
