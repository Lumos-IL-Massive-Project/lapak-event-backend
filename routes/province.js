const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getAllProvinces } = require("../controllers/province");

router.get("/", auth, getAllProvinces);

module.exports = router;
