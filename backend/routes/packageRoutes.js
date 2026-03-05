const express = require("express");
const router = express.Router();
const { upgradePackage } = require("../controllers/packageController");

router.get("/upgrade-package", upgradePackage);
module.exports = router;
