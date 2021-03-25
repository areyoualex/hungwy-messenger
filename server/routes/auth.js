const bcrypt = require('bcryptjs');

module.exports.login = (db) => {
  // TODO: login user
  return (req, res) => {};
}
module.exports.signup = (db) => {
  return async (req, res) => {
    /** POST endpoint, accept JSON with user's credentials + info. */

    // Make sure required inputs are provided and in correct format
    if (req.body.username == "" || !req.body.username)
      return res.status(400).send({ error: 'EmptyUsername' });
    if (typeof req.body.username !== "string" || req.body.username.length < 3)
      return res.status(400).send({ error: 'InvalidUsername' });
    if (req.body.password == "" || !req.body.password)
      return res.status(400).send({ error: 'EmptyPassword' });
    if (typeof req.body.password !== "string" || req.body.password.length < 8)
      return res.status(400).send({ error: 'InvalidPassword' });
    if (req.body.email == "" || !req.body.email)
      return res.status(400).send({ error: 'EmptyEmail' });
    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (typeof req.body.email !== "string" || !emailRegex.test(req.body.email))
      return res.status(400).send({ error: 'InvalidEmail' });

    // Try to find an existing user
    let existing = await db.collection("users").findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email },
      ]});

    // If username or email already exists, respond with error
    if (existing !== null)
      return res.status(400).send({ error: 'UserExists' });

    // Salt and hash password before storing
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        req.body.password = hash;
      });
    });

    // Store new user in database
    var user = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    };
    if (req.body.screenName) user.screenName = req.body.screenName;

    const result = await db.collection("users").insertOne(user);

    // If insertion unsuccessful, respond with error
    if (result.insertedCount !== 1) {
      console.log(result.insertedCount)
      return res.status(500).send({ error: 'DbInsertionError' });
    }

    // Respond with signup success
    res.status(201).send();

  };
}
