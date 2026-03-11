const { getCollection } = require("../db/dbConfig");

const upgradePackage = async (req, res) => {
  const result = await getCollection("packageCollection").find().toArray();
  res.send(result);
};
module.exports = { upgradePackage };
