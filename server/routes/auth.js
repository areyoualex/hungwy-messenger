const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.login = (db) => {
  return async (req, res) => {
    // Find a user that has an email or username matching their login
    let match = await db.collection("users").findOne({
      $or: [
        { username: req.body.login },
        { email: req.body.login }
      ]
    });
    // If there is no user with that email or username
    if (match == null)
      return res.status(400).send({ error: 'NoMatchingLogin' });

    // Try to confirm password
    bcrypt.compare(req.body.password, match.password, (err, isMatch) => {
      if (isMatch) {
        // Password matches, authorize a token
        let token = jwt.sign({username: match.username, password: match.password}, process.env.JWT_SECRET, {expiresIn: req.body.rememberMe ? "6 months" : "1d"});
        // Set authorization header and send
        res.set({'Authorization': token});
        res.status(200).send();
      } else {
        // Password doesn't match, send an error
        return res.status(400).send({ error: 'InvalidPassword' })
      }
    });

  };
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
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        req.body.password = hash;

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
          return res.status(500).send({ error: 'DbInsertionError' });
        }

        // Respond with signup success
        res.status(201).send();
      });
    });
  };
}
