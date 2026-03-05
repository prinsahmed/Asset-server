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



// Employee
router.post("/employee-join", verifyEmployee, employeeJoin);

// HR
router.put("/employee-approval/:id",verifyToken, verifyHR, employeeApproval);
router.put("/employee-reject/:id",verifyToken, verifyHR, employeeRejection);
router.get("/employee-request",verifyToken, verifyHR, requestedEmployees);
router.get("/employee-list",verifyToken, verifyHR, employees);
router.delete("/employee-delete/:id",verifyToken, verifyHR, employeeDelete);
router.put("/employee-company",verifyToken, verifyHR, affiliationByCompany);
router.post("/profile-update",verifyToken, usersProfileUpdate);

// user's data
router.get("/user-data", verifyToken, getUsersData);

module.exports = router;
