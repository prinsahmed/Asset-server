const express = require("express");
const router = express.Router();
const {
  employeeJoin,
  employeeApproval,
  employeeRejection,
  requestedEmployees,
  employees,
  employeeDelete,
  affiliationByCompany,
  usersProfileUpdate,
  getUsersData,
} = require("../controllers/usersController");
const {
  verifyToken,
  verifyEmployee,
  verifyHR,
} = require("../middlewares/authMiddleware");

router.use(verifyToken);

// Employee
router.post("/employee-join", verifyEmployee, employeeJoin);

// HR
router.put("/employee-approval/:id", verifyHR, employeeApproval);
router.put("/employee-reject/:id", verifyHR, employeeRejection);
router.get("/employee-request", verifyHR, requestedEmployees);
router.get("/employee-list", verifyHR, employees);
router.delete("/employee-delete/:id", verifyHR, employeeDelete);
router.put("/employee-company", verifyHR, affiliationByCompany);
router.put("/profile-update", verifyHR, usersProfileUpdate);

// user's data
router.get("/user-data", verifyToken, getUsersData);

module.exports = router;
