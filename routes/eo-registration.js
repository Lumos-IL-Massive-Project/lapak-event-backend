const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  registerEventOrganizer,
  uploadTemporaryDocument,
} = require("../controllers/eo-registration");
const {
  uploadEventOrganizerRegistrationDocument,
} = require("../middleware/multer");
const { body } = require("express-validator");

router.post(
  "/temp-document",
  uploadEventOrganizerRegistrationDocument.single("file"),
  auth,
  [
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("File harus berupa file");
      }

      return true;
    }),
  ],
  uploadTemporaryDocument
);
router.post(
  "/",
  auth,
  [
    body("company_name").notEmpty().withMessage("Nama perusahaan harus diisi!"),
    body("company_owner_name")
      .notEmpty()
      .withMessage("Nama pemilik perusahaan harus diisi!"),
    body("eo_name").notEmpty().withMessage("Nama Event Organizer harus diisi!"),
    body("npwp").notEmpty().withMessage("NPWP harus diisi!"),
    body("bio").notEmpty().withMessage("Bio harus diisi!"),
    body("product_category_id")
      .notEmpty()
      .withMessage("Kategori harus dipilih!"),
    body("country").notEmpty().withMessage("Negara harus diisi!"),
    body("province_id").notEmpty().withMessage("Provinsi harus dipilih!"),
    body("city_id").notEmpty().withMessage("Kota harus dipiih!"),
    body("postal_code").notEmpty().withMessage("Kode pos harus diisi!"),
    body("office_address").notEmpty().withMessage("Alamat harus diisi!"),
    body("documents.*.id").notEmpty().withMessage("ID dokumen tidak boleh kosong!"),
    body("documents.*.name").notEmpty().withMessage("Nama dokumen harus diisi!"),
    body("documents.*.url").notEmpty().withMessage("File dokumen harus dipilih!"),
  ],
  registerEventOrganizer
);

module.exports = router;
