const mongoose = require('mongoose'),
      Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

// Define MongoDB schema for users - this is how user data is stored
var userSchema = new Schema({
  username: {type: String, unique: true, required: "UsernameInvalid"},
  screenName: String,
  email: {type: String, unique: true, required: "EmailInvalid"},
  password: {type: String, select: false, required: "PasswordInvalid"}
  // TODO: add info like chat rooms, friends...
});

// Hash passwords before storing
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

// Method to confirm a user's stored hashed password
userSchema.methods.comparePassword = (pass, done) => {
  bcrypt.compare(pass, this.password, (err, isMatch)=>{ done(err, isMatch); });
}

module.exports = mongoose.model('User', userSchema);
