const express = require("express");
const router = express.Router();
const { upgradePackage } = require("../controllers/packageController");
const { verifyToken, verifyHR } = require("../middlewares/authMiddleware");

router.get("/upgrade-package", verifyToken, verifyHR, upgradePackage);
module.exports = router;
