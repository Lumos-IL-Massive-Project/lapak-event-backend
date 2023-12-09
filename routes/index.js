const express = require("express");
const router = express.Router();

// global
const auth = require("./auth");
const productCategory = require("./product-category");
const bank = require("./bank");

// admin
const bankAdmin = require('./admin/bank');
const productCategoryAdmin = require("./admin/product-category");

// global route
router.use("/auth", auth);
router.use("/product-category", productCategory);
router.use("/bank", bank);

// admin route
router.use("/admin/bank", bankAdmin);
router.use("/admin/product-category", productCategoryAdmin);

module.exports = router;
