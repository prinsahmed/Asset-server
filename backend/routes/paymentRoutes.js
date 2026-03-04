const express = require("express");
const router = express.Router();
const { checkOut, paymentStatus } = require("../controllers/paymentController");
const { verifyToken, verifyHR } = require("../middlewares/authMiddleware");

router.post("/create-checkout-session", verifyToken, verifyHR, checkOut);
router.get("/payment-status", verifyToken, verifyHR, paymentStatus);

module.exports = router;
