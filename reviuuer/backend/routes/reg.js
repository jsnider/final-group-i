var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysqlConf = require('../config.js').mysql_pool;
var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var secretJWT = process.env.JWT_SECRET;
var jwt  = require('jsonwebtoken');

function generateToken(username, email, admin, access){
  var u = {
   username: username,
   email: email,
   admin: admin,//user.admin, // TODO add so we can manage admin in DB
   access: access, //remove this and add a user id for each user THIS is no good
  };
  return token = jwt.sign(u, secretJWT,{
     expiresIn: 60 * 60 * 24 * 30 // expires in 30 days
  });
}

const registerUser = (username, email, password, cb) => {
  mysqlConf.getConnection(function (err, connection) {
    connection.query({
      sql: 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
      timeout: 40000, // 40s
      values: [username, email, password]
    }, function (error, results, fields) {
      connection.release();

      if(error) {
          console.error(error);
          cb(error, false);
      } else {
          console.log(results);
          cb(error, true);
      }
    });
  });
}

/* POST new user. */
router.post('/', function(req, res) {
    var username = req.param('username');
    var email = req.param('email');
    var myPlaintextPassword = req.param('password');

    if(username !== undefined && email !== undefined && myPlaintextPassword !== undefined) {
      bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
        registerUser(username, email, hash, (error, added) => {
          if(added) {
            var admin = false;
            var access = true;
            var tokenToSet = generateToken(username, email, admin, access);
            console.log('New user added')
            res.json({added: true,
                      token: tokenToSet}); //TODO set the real cookie
          }
        });
      });
    } else {
      console.log('Invalid inputs')
      res.json({added: false});
    }
  });

module.exports = router;
