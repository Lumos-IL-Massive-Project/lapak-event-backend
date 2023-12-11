const express = require("express");
const router = express.Router();

// global
const auth = require("./auth");
const productCategory = require("./product-category");
const bank = require("./bank");
const province = require("./province");

// admin
const bankAdmin = require("./admin/bank");
const productCategoryAdmin = require("./admin/product-category");
const userAdmin = require("./admin/user");
const provinceAdmin = require("./admin/province");

// global route
router.use("/auth", auth);
router.use("/product-category", productCategory);
router.use("/bank", bank);
router.use("/province", province);

// admin route
router.use("/admin/bank", bankAdmin);
router.use("/admin/product-category", productCategoryAdmin);
router.use("/admin/user", userAdmin);
router.use("/admin/province", provinceAdmin);

module.exports = router;
