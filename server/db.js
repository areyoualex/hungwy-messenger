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

  // Create validation rules for collections (users, rooms, ...)
  validateCollections(db);

  return db;
}

function validateCollections(db) {
  // Validation rules for users collection
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [ "username", "email", "password" ],
        properties: {
          username: {
            bsonType: "string",
            description: "Username must be a string and is required"
          },
          screenName: { bsonType: "string", description: "Screen name must be a string" },
          email: {
            bsonType: "string",
            description: "Email must be a string and is required"
          },
          password: {
            bsonType: "string",
            description: "Password must be a string and is required"
          },
          // TODO: add info like chat rooms, friends...
        }
      }
    }
  });
}
