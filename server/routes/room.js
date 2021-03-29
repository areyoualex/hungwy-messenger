const moment = require('moment');
const jwt = require('jsonwebtoken');

module.exports.sendMessage = (db) => {
  return async (req, res) => {
    // Confirm user is logged in (check authorization header)
    try {
      let token = jwt.verify(req.header('Authorization'), process.env.JWT_SECRET);
      console.log(token);
      let match = await db.collection("users").findOne({
        username: token.username,
        password: token.password
      });
      if (match === null) {
        res.set({'Authorization': ""});
        res.status(403).send({ error: 'InvalidLogin' });
        return;
      }
      // Confirm user is in the room (get the room, see if username is in users list)
      let roomMatch = await db.collection("rooms").findOne({
        _id: req.body.room,
        users: token.username
      });
      if (roomMatch === null) {
        res.status(403).send({ error: 'InvalidRoom' });
        return;
      }
      // Add the message to the room's list of messages
      req.body.message.date = moment();
      await db.collection("rooms").updateOne({
        _id: req.body.room
      }, {
        $push: { messages: req.body.message }
      });
      res.status(201).send();

    } catch (error) {
      res.set({'Authorization': ""});
      res.status(403).send({ error: 'InvalidLogin' });
      return;
    }
  };
};
