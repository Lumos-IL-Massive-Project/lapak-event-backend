const express = require("express");
const { body } = require("express-validator");
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

router.get("/", authAdmin, getAllUsers);
router.get("/:id", authAdmin, getUserDetails);
router.post(
  "/",
  uploadUserProfileImage.single("image"),
  authAdmin,
  [
    body("username").notEmpty().withMessage("Username harus diisi!"),
    body("email")
      .notEmpty()
      .withMessage("Email harus diisi!")
      .isEmail()
      .withMessage("Email harus berformat email"),
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
  createUser
);
router.put(
  "/:id",
  uploadUserProfileImage.single("image"),
  authAdmin,
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
router.delete("/:id", authAdmin, deleteUser);

module.exports = router;
