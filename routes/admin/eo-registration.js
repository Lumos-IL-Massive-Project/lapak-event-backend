const express = require("express");
const router = express.Router();
const { authAdmin } = require("../../middleware/auth");
const {
  registerApprovalAction,
  getAllEventOrganizerRegistrations,
  getEventOrganizerRegistrationDetails,
} = require("../../controllers/eo-registration");
const { approvalValidator } = require("../../middleware/eo-registration");

router.get("/", authAdmin, getAllEventOrganizerRegistrations);
router.get("/:id", authAdmin, getEventOrganizerRegistrationDetails);
router.put(
  "/approval/:id",
  authAdmin,
  approvalValidator,
  registerApprovalAction
);

module.exports = router;
