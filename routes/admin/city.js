const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  getCityDetails,
  createCity,
  updateCity,
  deleteCity,
} = require("../../controllers/city");
const { body } = require("express-validator");

router.get("/:id", authAdmin, getCityDetails);
router.post(
  "/",
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama kota harus diisi!"),
    body("province_id").notEmpty().withMessage("Provinsi harus diisi!"),
    body("type")
      .notEmpty()
      .withMessage("Jenis kota harus diisi!")
      .custom((value, { req }) => {
        const allowedType = ["city", "district"];

        if (!allowedType.includes(value)) {
          throw new Error("Jenis kota tidak valid");
        }

        return true;
      }),
    body("postal_code").notEmpty().withMessage("Kode pos harus diisi!"),
  ],
  createCity
);
router.put(
  "/:id",
  authAdmin,
  [
    body("name").notEmpty().withMessage("Nama kota harus diisi!"),
    body("province_id").notEmpty().withMessage("Provinsi harus diisi!"),
    body("type")
      .notEmpty()
      .withMessage("Jenis kota harus diisi!")
      .custom((value, { req }) => {
        const allowedType = ["city", "district"];

        if (!allowedType.includes(value)) {
          throw new Error("Jenis kota tidak valid");
        }

        return true;
      }),
    body("postal_code").notEmpty().withMessage("Kode pos harus diisi!"),
  ],
  updateCity
);
router.delete("/:id", authAdmin, deleteCity);

module.exports = router;
