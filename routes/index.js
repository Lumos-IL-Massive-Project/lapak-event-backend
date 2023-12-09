const express = require("express");
const router = express.Router();

const auth = require("./auth");
const productCategory = require("./product-category");
const bank = require("./bank");

router.use("/auth", auth);
router.use("/product-category", productCategory);
router.use("/bank", bank);

module.exports = router;
