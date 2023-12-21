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
const {
  tempDocumentValidator,
  registerEventOrganizerValidator,
} = require("../middleware/eo-registration");

router.post(
  "/temp-document",
  uploadEventOrganizerRegistrationDocument.single("file"),
  auth,
  tempDocumentValidator,
  uploadTemporaryDocument
);
router.post("/", auth, registerEventOrganizerValidator, registerEventOrganizer);

module.exports = router;
