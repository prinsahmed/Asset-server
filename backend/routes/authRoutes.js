const express = require("express");
const router = express.Router();
const {
  registerEmployee,
  registerHR,
  JWT_token,
} = require("../controllers/authController");

router.post("/jwt", JWT_token);
router.post("/user-employee", registerEmployee);
router.post("/user-HR", registerHR);

module.exports = router;
