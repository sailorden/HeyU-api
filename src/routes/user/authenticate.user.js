'use strict';

const User = require('./../../models/user');

module.exports = (req, res) => {
  User.facebook(req.query.code, (err, profile) => {
    if (err) return res.send(err).status(500);
    User.create('facebook', profile, (err, user) => {
      if (err) return res.send(err).status(500);
      let token = User.token();
      return res.send({token: token, user: user});
    });
  });

};