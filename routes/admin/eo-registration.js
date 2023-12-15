const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  registerApprovalAction,
  getAllEventOrganizerRegistrations,
  getEventOrganizerRegistrationDetails,
} = require("../../controllers/eo-registration");

router.get("/", authAdmin, getAllEventOrganizerRegistrations);
router.get("/:id", authAdmin, getEventOrganizerRegistrationDetails);
router.put(
  "/approval/:id",
  authAdmin,
  [
    body("status")
      .notEmpty()
      .withMessage("Status harus dipilih!")
      .custom((value, { req }) => {
        const allowedStatus = ["rejected", "approved"];

        if (!allowedStatus.includes(value)) {
          throw new Error("Status tidak valid");
        }

        return true;
      }),
    body("reasons").custom((value, { req }) => {
      if (req.body.status === "rejected") {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("Reasons harus diisi!");
        }
      }
      return true;
    }),
  ],
  registerApprovalAction
);

module.exports = router;
