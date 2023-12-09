const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getAllBanks } = require("../controllers/bank");

router.get("/", auth, getAllBanks);

module.exports = router;
