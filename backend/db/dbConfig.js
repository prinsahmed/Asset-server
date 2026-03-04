const dns = require("node:dns");
// Bypasses the Windows DNS bug by forcing Google's DNS inside the app
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    // await client.connect();
    db = client.db("assetDB");
    // console.log("Database collections initialized!");
  } catch (error) {
    // console.error("DB connection error:", error);
  }
}

// Collection getter
const getCollection = (collectionName) => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db.collection(collectionName);
};

module.exports = {
  getCollection,
  connectDB,
};
