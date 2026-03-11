const { ObjectId } = require("mongodb");
const { getCollection } = require("../db/dbConfig");

// Employee assets
const requestedAssets = async (req, res) => {
  const filter = req.query.filter;
  const search = req.query.search.toLowerCase().trim() || "";
  const email = req.query.email || "";
  const query = { requesterEmail: email };
  if (search) {
    query.productName = { $regex: search, $options: "i" };
  }
  if (filter && filter !== "All Types") {
    query.productType = filter;
  }
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  result = await getCollection("assetRequestCollection").find(query).toArray();
  res.send(result);
};

const assetsReturn = async (req, res) => {
  const id = req.params.id;
  const status = req.body;
  const query = {};
  if (id) {
    query._id = new ObjectId(id);
  }
  update = { $set: status };
  result = await getCollection("assetRequestCollection").updateOne(
    query,
    update,
  );
  res.send(result);
};

const showAssets = async (req, res) => {
  const filter = req.query.filter;
  const search = req.query.search.toLowerCase().trim() || "";
  const email = req.query.email;
  const query = {};
  if (email) {
    query.employeeEmail = email;
  }
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });

  const result = await getCollection("employeeRequestsCollection")
    .find(query)
    .toArray();
  const companyNames = result.map((ele) => ele.companyName);

  const query2 = { companyName: { $in: companyNames } };
  if (search) {
    query2.productName = { $regex: search, $options: "i" };
  }

  if (filter && filter !== "All Types") {
    query2.productType = filter;
  }
  const assets = await getCollection("assetCollection").find(query2).toArray();

  res.send(assets);
};

const addAssetsRequest = async (req, res) => {
  const productData = req.body;
  const result = await getCollection("assetRequestCollection").insertOne(
    productData,
  );
  res.send(result);
};

// HR assets
const addAssets = async (req, res) => {
  const product = req.body;
  const result = await getCollection("assetCollection").insertOne(product);
  res.send(result);
};

const addedAssets = async (req, res) => {
  const email = req.query.email;
  const search = req.query.search?.toLowerCase().trim() || "";
  let query = { hrEmail: email };
  if (search) {
    query.productName = { $regex: search, $options: "i" };
  }

  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });

  const result = await getCollection("assetCollection").find(query).toArray();
  res.send(result);
};

const assetsDelete = async (req, res) => {
  const id = req.params.id;

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).send({ success: false, message: "Invalid ID" });
  }
  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const result = await getCollection("assetCollection").deleteOne(query);
  res.send(result);
};

const assetsEdit = async (req, res) => {
  const { id } = req.params;
  const editedProduct = req.body;

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).send({ success: false, message: "Invalid ID" });
  }

  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const update = { $set: editedProduct };
  const result = await getCollection("assetCollection").updateOne(
    query,
    update,
  );
  res.send(result);
};

const allRequestedAssets = async (req, res) => {
  const email = req.query.email;
  const query = {};
  if (email) {
    query.hrEmail = email;
  }
  if (email !== req.token_email)
    return res.status(403).send({ message: "forbidden access" });
  const result = await getCollection("assetRequestCollection")
    .find(query)
    .toArray();
  res.send(result);
};

const assetsApproval = async (req, res) => {
  const { requestStatus, productId } = req.body;
  const id = req.params.id;
  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const update = {
    $set: {
      requestStatus: requestStatus,
      approvalDate: new Date(),
    },
  };
  const productQuery = {
    _id: new ObjectId(productId),
    productQuantity: { $gt: 0 },
  };
  const assetCountUpdate = await getCollection("assetCollection").updateOne(
    productQuery,
    {
      $inc: { productQuantity: -1 },
    },
  );

  const result = await getCollection("assetRequestCollection").updateOne(
    query,
    update,
  );
  res.send(result);
};

const assetsRejection = async (req, res) => {
  const requestStatus = req.body;
  const id = req.params.id;
  const query = { _id: new ObjectId(id), hrEmail: req.token_email };
  const update = { $set: requestStatus };
  const result = await getCollection("assetRequestCollection").updateOne(
    query,
    update,
  );
  res.send(result);
};

module.exports = {
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
};
