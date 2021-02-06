
const express = require("express");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var router = express.Router();

const db = require("../../models/Database_Connection");
const auth = require('../common/authentication');


  // REGISTER PAGE
  router.post('/register', auth,
  // post data validation(using express-validator)
  [
    body('user_email','Invalid email address!').isEmail().custom((value) => {
        return db.execute('SELECT `email` FROM `users_table` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length > 0){
                return Promise.reject('This E-mail already in use!');
            }
            return true;
        });
    }),
    body('user_name','Username is Empty!').trim().not().isEmpty(),
    body('user_pass','The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
  ],// end of post data validation
  (req,res,next) => {

    const validation_result = validationResult(req);
    const {user_name, user_pass, user_email} = req.body;
    // IF validation_result HAS NO ERROR
    if(validation_result.isEmpty()){
        // password encryption (using bcryptjs)
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            // INSERTING USER INTO DATABASE
            db.execute("INSERT INTO `users_table`(`name`,`email`,`password`) VALUES(?,?,?)",[user_name,user_email, hash_pass])
            .then(result => {
                res.send(`your account has been created successfully, Now you can <a href="/">Login</a>`);
            }).catch(err => {
                // THROW INSERTING USER ERROR'S
                if (err) throw err;
            });
        })
        .catch(err => {
            // THROW HASING ERROR'S
            if (err) throw err;
        })
    }
    else{
        // COLLECT ALL THE VALIDATION ERRORS
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        // REDERING login-register PAGE WITH VALIDATION ERRORS
        res.render('login-register', {
            PageTitle: 'login-register Error',
            isAuthenticated: req.session.isLoggedIn,
            register_error:allErrors,
            old_data:req.body
        });
    }
  });// END OF REGISTER PAGE

  
  module.exports = router;