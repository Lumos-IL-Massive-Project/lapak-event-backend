const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getUserProfile, updateUser } = require("../controllers/user");
const { uploadUserProfileImage } = require("../middleware/multer");
const { body } = require("express-validator");

router.get("/profile", auth, getUserProfile);
router.put(
  "/profile/:id",
  uploadUserProfileImage.single("image"),
  auth,
  [
    body("username").notEmpty().withMessage("Username harus diisi!"),
    body("phone_number").notEmpty().withMessage("Nomor hp harus diisi!"),
    body("role")
      .notEmpty()
      .withMessage("Role harus diisi!")
      .custom((value, { req }) => {
        const allowedRoles = ["user", "admin", "event organizer"];

        if (!allowedRoles.includes(value)) {
          throw new Error("Role tidak valid");
        }

        return true;
      }),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image harus berupa file");
      }

      return true;
    }),
  ],
  updateUser
);

module.exports = router;
