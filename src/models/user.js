'use strict';

const mongoose = require('mongoose'),
      jwt = require('jwt-simple'),
      moment = require('moment'),
      Request = require('request'),
      qs = require('query-string'),
      bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  facebook:     { type: String, required: true },
  name:         { type: String, required: true },
  gender:       { type: String, required: true },
  photo:        { type: String, required: true },
  age:          { type: Number },
  bio:          { type: String },
  profession:   { type: String },
  interests:    [{ type: String }],
  createdAt:    { type: Date, default: Date.now, required: true }
});


userSchema.statics.login = (payload, cb) => {
  User.findOne({facebook: payload.id}, (err, user) => {
    if (err) return cb(err);
    if (user) return cb(null, user, true);
    else {
      user = {
        facebook: payload.id,
        name: payload.first_name,
        gender: payload.gender,
        photo: `https://graph.facebook.com/${payload.id}/picture?type=large`
      };
      let newUser = new User(user);
      newUser.save((err, newUser) => cb(err, newUser, false));
    }
  });
};


// trying to use => broke this function because it couldn't get User
// as the context from User.token(). And apparently you can't change
// a function's context with the the bind/call/apply trio when using
// the fat arrow syntax.
userSchema.methods.token = function() {
  let payload = {
    sub: this._id,
    iat: moment().unix(),
    exp: moment().add('30', 'days')
  };
  return jwt.encode(payload, process.env.TOKEN_SECRET);
};

// userSchema.methods.sanitize = () => {
//   let userObject = this.toObject();
//   delete userObject.password;
//   return userObject;
// };

const User = mongoose.model('User', userSchema);
module.exports = User;
