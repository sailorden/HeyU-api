'use strict';

const User = require('./../../models/user');

module.exports = (req, res) => {
  User.login(req.body, (err, user, alreadyInDB) => {
    if (err) return res.status(500);
    let token = user.token();
    return res.send({user, token, alreadyInDB});
  });
};