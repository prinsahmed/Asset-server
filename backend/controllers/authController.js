const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../db/dbConfig");

// Token generation
const JWT_token = async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.send({ token });
};

// HR registration
const registerHR = async (req, res) => {
  const HRData = req.body;

  if (HRData) {
    HRData.role = "HR";
    HRData.packageLimit = 5;
    HRData.currentEmployees = 0;
    HRData.subscription = "basic";
    const saltRounds = 10;
    const plainPassword = HRData.password;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    HRData.password = hashedPassword;

    const result = await getCollection("usersCollection").insertOne(HRData);
    res.send(result);
  }
};

// Employee Registration
const registerEmployee = async (req, res) => {
  const EmplyeeData = req.body;
  if (EmplyeeData) {
    EmplyeeData.role = "Employee";
    const saltRounds = 10;
    const plainPassword = EmplyeeData.password;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    EmplyeeData.password = hashedPassword;
    const result =
      await getCollection("usersCollection").insertOne(EmplyeeData);
    res.send(result);
  }
};

module.exports = { registerHR, registerEmployee, JWT_token };
