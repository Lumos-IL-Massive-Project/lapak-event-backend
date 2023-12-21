const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
} = require("../../controllers/user");
const { uploadUserProfileImage } = require("../../middleware/multer");
const {
  createUserValidator,
  updateUserValidator,
} = require("../../middleware/user");

router.get("/", authAdmin, getAllUsers);
router.get("/:id", authAdmin, getUserDetails);
router.post(
  "/",
  uploadUserProfileImage.single("image"),
  authAdmin,
  createUserValidator,
  createUser
);
router.put(
  "/:id",
  uploadUserProfileImage.single("image"),
  authAdmin,
  updateUserValidator,
  updateUser
);
router.delete("/:id", authAdmin, deleteUser);

module.exports = router;
