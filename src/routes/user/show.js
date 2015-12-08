'use strict';

const User = require('./../../models/user');

// takes user id as params userId
module.exports = (req, res) => {
  if (req.params.userId === '001') return res.send({name:'todd'})
  else if (req.params.userId === '002') return res.send({name:'kent'})


  User.findById(req.params.userId).select('-facebook -createdAt')
  .exec((err, user) => {
    if (err) return res.send(err).status(500);
    if (!user) return res.send('USER NOT FOUND').status(400);
    return res.send(user);
  });
};
