const express = require("express");
var router = express.Router();

const Data_extractor = require("../../models/Data_extraction");
const Data_insert = require("../../models/Data_insert");


  //view Single Book Page with recommendation after user rating a book
  router.post("/book/:productId", (req, res, next) =>
  {

      let book_id = req.params.productId;
      let user_id = req.session.userID;
      let user_Rating = req.body.rating;

    console.log('RATING ADDED TO DATABASE: ' + user_Rating)
    // check if user has rated this book before
      Data_extractor("SELECT * FROM booker.users_books_table WHERE user_id = " + user_id + " " + "AND book_id = " + book_id).then((data) => {
      console.log("data length: " + data[1]);
      // if data[1] (i.e length of result) is more than 0. then we'll update the row. otherwise just add the row.
      if(data[1] > 0) {
        console.log("user rated this book before. so don't add a new rating. just update their existing rating");
        Data_insert("UPDATE booker.users_books_table SET rating = " + user_Rating + " WHERE user_id = " + user_id + " AND book_id = " + book_id);

      }
      else{
        console.log("book rating added " + user_Rating)
      Data_insert("INSERT INTO booker.users_books_table (user_id, book_id, rating) VALUES (" + "'" + user_id + "'," + "'" + book_id + "'," + "'" + user_Rating + "')");
      }
    })
  });


module.exports = router;