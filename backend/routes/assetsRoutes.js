const express = require("express");
const router = express.Router();
const {
  requestedAssets,
  assetsReturn,
  showAssets,
  addAssetsRequest,
  addAssets,
  addedAssets,
  assetsDelete,
  assetsEdit,
  allRequestedAssets,
  assetsApproval,
  assetsRejection,
} = require("../controllers/assetsController");
const {
  verifyToken,
  verifyEmployee,
  verifyHR,
} = require("../middlewares/authMiddleware");

// router.use(verifyToken);

// Employee assets
router.get("/employee-assets", verifyToken, verifyEmployee, requestedAssets);
router.put(
  "/employee-assets-return/:id",
  verifyToken,
  verifyEmployee,
  assetsReturn,
);
router.get("/employee-assets-request", verifyToken, verifyEmployee, showAssets);
router.post(
  "/employee-add-request",
  verifyToken,
  verifyEmployee,
  addAssetsRequest,
);

// HR assets
router.post("/add-product", verifyToken, verifyHR, addAssets);
router.get("/all-asset", verifyToken, verifyHR, addedAssets);
router.delete("/all-asset/delete/:id", verifyToken, verifyHR, assetsDelete);
router.put("/all-asset/edit/:id", verifyToken, verifyHR, assetsEdit);
router.get("/all-assets-requests", verifyToken, verifyHR, allRequestedAssets);
router.put("/asset-approval/:id", verifyToken, verifyHR, assetsApproval);
router.put("/asset-reject/:id", verifyToken, verifyHR, assetsRejection);

module.exports = router;
