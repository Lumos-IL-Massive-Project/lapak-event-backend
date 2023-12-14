const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getAllCities } = require("../controllers/city");

router.get("/", auth, getAllCities);

module.exports = router;
