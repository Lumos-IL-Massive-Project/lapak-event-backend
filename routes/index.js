const express = require("express");
const router = express.Router();

// global
const auth = require("./auth");
const productCategory = require("./product-category");
const bank = require("./bank");
const province = require("./province");
const city = require("./city");
const user = require("./user");

// admin
const bankAdmin = require("./admin/bank");
const productCategoryAdmin = require("./admin/product-category");
const userAdmin = require("./admin/user");
const provinceAdmin = require("./admin/province");
const cityAdmin = require("./admin/city");

// global route
router.use("/auth", auth);
router.use("/product-category", productCategory);
router.use("/bank", bank);
router.use("/province", province);
router.use("/city", city);
router.use("/user", user);

// admin route
router.use("/admin/bank", bankAdmin);
router.use("/admin/product-category", productCategoryAdmin);
router.use("/admin/user", userAdmin);
router.use("/admin/province", provinceAdmin);
router.use("/admin/city", cityAdmin);

module.exports = router;
