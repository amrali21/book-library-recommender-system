const express = require("express");
var router = express.Router();

 // LOGOUT
 router.get('/logout',(req,res)=>{
    //session destroy
    req.session = null;
    res.redirect('/index');
  });
  // END OF LOGOUT

  module.exports = router;