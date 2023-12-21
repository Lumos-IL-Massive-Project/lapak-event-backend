const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getUserProfile, updateUser } = require("../controllers/user");
const { uploadUserProfileImage } = require("../middleware/multer");
const { updateUserValidator } = require("../middleware/user");

router.get("/profile", auth, getUserProfile);
router.put(
  "/profile/:id",
  uploadUserProfileImage.single("image"),
  auth,
  updateUserValidator,
  updateUser
);

module.exports = router;
updateUserValidator;
