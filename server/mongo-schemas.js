// Init script to initialize collections with valid schemas.
// Run this in command line using "mongo mongo-schemas.js".

db = db.getSiblingDB("messenger")

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
