const express = require("express");
const router = express.Router();

const auth = require('./auth');
const productCategory = require('./product-category');

router.use('/auth', auth);
router.use('/product-category', productCategory);

module.exports = router;