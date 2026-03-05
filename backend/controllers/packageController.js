const { getCollection } = require("../db/dbConfig");

const upgradePackage = async (req, res) => {
  const result = await getCollection("packageCollection").find().toArray();
  console.log(result)
  res.send(result);
};
module.exports = { upgradePackage };
