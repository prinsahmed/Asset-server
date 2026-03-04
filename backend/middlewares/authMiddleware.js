const jwt = require("jsonwebtoken");
const { getCollection } = require("../db/dbConfig");

// Token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send({ message: "unauthorized access" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }

    req.token_email = decoded.email;
    next();
  });
};

// HR middleware
const verifyHR = async (req, res, next) => {
  const email = req.token_email;
  const query = { email: email };
  const user = await getCollection("usersCollection").findOne(query);

  if (user?.role !== "HR") {
    return res.status(403).send({
      message: "Access Forbidden: Only HR can perform this action",
    });
  }

  next();
};

// Employee middleware
const verifyEmployee = async (req, res, next) => {
  const email = req.token_email;
  const query = { email: email };
  const user = await getCollection("usersCollection").findOne(query);

  if (user?.role !== "Employee") {
    return res.status(403).send({
      message: "Access Forbidden: Only employee can perform this action",
    });
  }

  next();
};

module.exports = { verifyToken, verifyHR, verifyEmployee };
