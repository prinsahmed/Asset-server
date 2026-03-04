const { ObjectId } = require("mongodb");
const { getCollection } = require("../db/dbConfig");

// Employee side initiative

const employeeJoin = async (req, res) => {
  const user = req.body;
  const result = await getCollection("employeeRequestsCollection").insertOne(
    user,
  );
  res.send(result);
};

// HR side initiative

const requestedEmployees = async (req, res) => {
  const email = req.query.email;

  const query = {};
  if (email) {
    query.hrEmail = email;
  }
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  const result = await getCollection("employeeRequestsCollection")
    .find(query)
    .toArray();
  res.send(result);
};

const employeeApproval = async (req, res) => {
  const { status, companyName } = req.body;

  const id = req.params.id;
  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const LatestUpdate = {
    $set: {
      status: status,
      approvalDate: new Date(),
      companyName: companyName,
    },
  };
  const result = await getCollection("employeeRequestsCollection").updateMany(
    query,
    LatestUpdate,
  );
  res.send(result);
};

const employeeRejection = async (req, res) => {
  const status = req.body;
  const id = req.params.id;
  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const update = { $set: status };
  const result = await getCollection("employeeRequestsCollection").updateOne(
    query,
    update,
  );
  res.send(result);
};

const employees = async (req, res) => {
  const email = req.query.email;
  const query = {};
  if (email) {
    query.hrEmail = email;
    query.status = "approved";
  }
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  const result = await getCollection("employeeRequestsCollection")
    .find(query)
    .toArray();
  res.send(result);
};

const employeeDelete = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { hrEmail: req.token_email };
  if (id) {
    query._id = new ObjectId(id);
  }
  result = await getCollection("employeeRequestsCollection").deleteOne(query);
  res.send(result);
};

const affiliationByCompany = async (req, res) => {
  const { companyName } = req.body;
  const email = req.query.email;
  const query = {};
  if (email) {
    query.email = email;
  }
  update = {
    $set: {
      companyName: companyName,
    },
  };
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  result = await getCollection("usersCollection").updateOne(query, update);
  res.send(result);
};

// profile update

const usersProfileUpdate = async (req, res) => {
  const email = req.query.email;
  const userData = req.body;
  const query = {};
  if (email) {
    query.email = email;
  }

  const update = {
    $set: userData,
  };
  const result = await getCollection("usersCollection").updateMany(
    query,
    update,
  );
  res.send(result);
};

// user's data
const getUsersData = async (req, res) => {
  const email = req.query.email;
  const query = {};
  if (email) {
    query.email = email;
  }
  const options = {
    projection: { password: 0 },
  };

  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  const result = await getCollection("usersCollection").findOne(query, options);
  res.send(result);
};

module.exports = {
  employeeJoin,
  employeeApproval,
  employeeRejection,
  requestedEmployees,
  employees,
  employeeDelete,
  affiliationByCompany,
  usersProfileUpdate,
  getUsersData,
};
