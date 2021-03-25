const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || "127.0.0.1:27017";
const client = new MongoClient(`mongodb://${uri}:27017/`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports.connect = async function() {
  // Attempt to connect to MongoDB server
  await client.connect();
  const db = client.db("messenger");

  return db;
}
