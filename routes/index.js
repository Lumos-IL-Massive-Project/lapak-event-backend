const express = require("express");
const router = express.Router();

const auth = require('./auth');
const productCategories = require('./product-categories');

router.use('/auth', auth);
router.use('/product-category', productCategories);

module.exports = router;