const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getAllProductCategories } = require("../controllers/product-category");

router.get("/", auth, getAllProductCategories);

module.exports = router;
