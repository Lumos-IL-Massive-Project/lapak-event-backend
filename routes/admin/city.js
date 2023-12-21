const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getCityDetails,
  createCity,
  updateCity,
  deleteCity,
} = require("../../controllers/city");
const { cityValidator } = require("../../middleware/city");

router.get("/:id", authAdmin, getCityDetails);
router.post("/", authAdmin, cityValidator, createCity);
router.put("/:id", authAdmin, cityValidator, updateCity);
router.delete("/:id", authAdmin, deleteCity);

module.exports = router;
