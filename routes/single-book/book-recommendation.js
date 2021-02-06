const express = require("express");
var router = express.Router();
const Data_extractor = require("../../models/Data_extraction");
const recommendation = require("../../Recommendation System/recommendation_connection.js");


  //view Single Book Page with recommendation
  router.get("/book/:productId", (req, res, next) =>
  {

    if (!req.session.isLoggedIn)
     {
          res.redirect('/login')
     }
     else {
        console.log('running rec code.');
        let id = req.params.productId;
        const Books_recommended = new Promise((resolve) =>
        {
            recommendation.rec(req.session.userID); //Sending user ID to python
            resolve();
        });
        Books_recommended.then(() =>
        {
            recommendation.rexx.then((recommended_books_ids) =>
            {
                console.log("recommended_books_ids = ", recommended_books_ids);
                
                Data_extractor('SELECT * FROM booker.books_table where book_id IN (' + id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + "," + recommended_books_ids[4] + "," + recommended_books_ids[5] + ")" + 'ORDER BY FIELD(book_id,' + id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + "," + recommended_books_ids[4] + "," + recommended_books_ids[5] + ")").then((data) =>
                {
                    res.render("product-single", {PageTitle: data[0][0].Book_Title, books: data[0], no_of_books: data[1], err: data[2], name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
                    console.log("dataTest = ", data[0][0].Book_Title);
                });
            });
        });
     }



  });

  module.exports = router;