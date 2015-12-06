'use strict';

const mongoose = require('mongoose'),
      jwt = require('jwt-simple'),
      moment = require('moment'),
      Request = require('request'),
      qs = require('query-string'),
      bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  facebook:     { type: String },
  name:         { type: String },
  gender:       { type: String },
  photo:        { type: String },
  createdAt:    { type: Date, default: Date.now, required: true }
});


// Takes auth code acquired from facebook auth request.
// Returns user profile to callback.
userSchema.statics.facebook = (authCode, cb) => {
  let fields = ['first_name', 'gender'];
  let accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
  let graphApiUrl = `https://graph.facebook.com/me?fields=${fields.join(',')}`;
  let params = {
    code: authCode,
    client_id: '197260627276113',
    client_secret: process.env.FACEBOOK_SECRET,
    redirect_uri: 'http://localhost:3000/auth/facebook'
  };
  Request.get({url: accessTokenUrl, qs: params, json: true}, (err, response, accessToken) => {
    accessToken = qs.parse(accessToken);
    Request.get({url: graphApiUrl, qs: accessToken, json: true}, (err, response, profile) => {
      if (profile.error) return cb(profile.error.message);
      cb(null, {facebook: profile.id, name: profile.first_name, gender: profile.gender, photo: `https://graph.facebook.com/${profile.id}/picture?type=large`});
    });
  });
};

userSchema.statics.create = (provider, profile, cb) => {
  let query = {};
  query[provider] = profile[provider];
  User.findOne(query, (err, user) => {
    if (user) return cb(null, user);
    user = new User(profile);
    user.save(cb);
  });
};


// trying to use => broke this function because it couldn't get User
// as the context from User.token(). And apparently you can't change
// a function's context with the the bind/call/apply trio when using
// the fat arrow syntax.
userSchema.statics.token = function() {
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
