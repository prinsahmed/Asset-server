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

router.use(verifyToken);

// Employee assets
router.get("/employee-assets", verifyEmployee, requestedAssets);
router.put("/employee-assets-return/:id", verifyEmployee, assetsReturn);
router.get("/employee-assets-request", verifyEmployee, showAssets);
router.post("/employee-add-request", verifyEmployee, addAssetsRequest);

// HR assets
router.post("/add-product", verifyHR, addAssets);
router.get("/all-asset", verifyHR, addedAssets);
router.delete("/all-asset/delete/:id", verifyHR, assetsDelete);
router.put("/all-asset/edit/:id", verifyHR, assetsEdit);
router.get("/all-assets-requests", verifyHR, allRequestedAssets);
router.put("/asset-approval/:id", verifyHR, assetsApproval);
router.put("/asset-reject/:id", verifyHR, assetsRejection);

module.exports = router;
