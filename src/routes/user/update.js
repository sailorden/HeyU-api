'use strict';

const User = require('./../../models/user');

// takes userId in params and updated user in body
module.exports = (req, res) => {
  if (req.body && req.params.userId) {
    User.findByIdAndUpdate(req.params.userId, req.body, {new: true})
    // .select('-password')
    .exec((err, user) => {
      if (err || !user) return res.status(500).send('Error updating user');
      return res.status(200).send(user);
    });
  } else {
    return res.status(400).send('Error sending data');
  }
};
