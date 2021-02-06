const express = require("express");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var router = express.Router();

const db = require("../../models/Database_Connection");
const auth = require('../common/authentication');




  router.get('/login', auth, (req,res,next) => {
     
    res.render('login-register', { PageTitle: 'login-register', name: "", isAuthenticated: req.session.isLoggedIn});


  });// END OF ROOT PAGE

   // LOGIN PAGE. 
   router.post('/login', auth, [
    body('user_email').custom((value) => {
        return db.execute('SELECT `email` FROM `users_table` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length == 1){
                return true;

            }
            return Promise.reject('Invalid Email Address!');

        });
    }),
    body('user_pass','Password is empty!').trim().not().isEmpty(),
  ], (req, res) => {
    const validation_result = validationResult(req);
    const {user_pass, user_email} = req.body;           // input is valid (email exists and password is not empty or less than x chars)
    if(validation_result.isEmpty()){

        db.execute("SELECT * FROM `users_table` WHERE `email`=?",[user_email])
        .then(([rows]) => {
            bcrypt.compare(user_pass, rows[0].password).then(compare_result => { // [THIS] after login is valid , authenticate user (store their data in session)
                if(compare_result === true){
                  // CMT
                    req.session.isLoggedIn = true;
                    req.session.userID = rows[0].user_id;
                    req.session.name = rows[0].name;
                    req.session.is_admin = rows[0].is_admin;
                    res.redirect('/index');
                }
                else{
                    res.render('login-register', {
                        PageTitle: 'login-register',
                        isAuthenticated: req.session.isLoggedIn,
                        login_errors:['Invalid Password!']
                    });
                }
            })
            .catch(err => {
                if (err) throw err;
            });


        }).catch(err => {
            if (err) throw err;
        });
    }
    else{
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        // REDERING login-register PAGE WITH LOGIN VALIDATION ERRORS
        res.render('login-register', {
            PageTitle: 'login-register Error',
            isAuthenticated: req.session.isLoggedIn,
            login_errors:allErrors
        });
    }
  });
  // END OF LOGIN PAGE
  

  module.exports = router;