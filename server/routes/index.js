const moment = require('moment');
const jwt = require('jsonwebtoken');

// Import routes
const Auth = require('./auth');
const Room = require('./room');

// Add routes/endpoints to server
module.exports = (app, db) => {
  // Authentication routes
  app.post('/auth/login', Auth.login(db));
  app.post('/auth/signup', Auth.signup(db));
  app.post('/room/sendMessage', Room.sendMessage(db));
}
