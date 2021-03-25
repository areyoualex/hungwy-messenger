const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Values in file called ".env" will be assigned to process.env (treated like
// environment variables)
require('dotenv').config();

// Initialize Express.js server
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// If we're in a production environment, force HTTPS
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

// Connect to MongoDB at MONGO_URI (environment variable)
mongoose.connect(process.env.MONGO_URI || "192.169.0.1:27017");
mongoose.connection.on('error', function(err) {
  throw new Error('Error: Could not connect to MongoDB.');
});

// Load API routes/endpoints
require('./routes')(app);

// Check that we have a secret key for JWT
if (!process.env.JWT_SECRET) throw new Error('No JWT_SECRET set. Please set a secret key.');

// Start the server at PORT, or :3000
app.listen(process.env.PORT || 3000);
