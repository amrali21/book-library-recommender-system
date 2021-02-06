const express = require("express");
var router = express.Router();
const Data_insert = require("../models/Data_insert");
let genres = require('./common/genres')

 
 // Add new book to database page accessable only by admin users
router.get("/add-new-book", (req, res, next) =>
{
    if(req.session.isLoggedIn){
        res.render("add-new-book", {PageTitle: 'Add New Book To Database', genres: genres, name: req.session.name,is_admin: req.session.is_admin,isAuthenticated: req.session.isLoggedIn});
    }
    else{
        res.redirect('/login');
    }
});
  


  // sending the new added book data to be stored in mysql database table "books_table"
  router.post("/add-new-book-to-database", (req, res, next) =>
  {
      let ISBN = req.body.ISBN;
      let Book_Title = req.body.Book_Title;
      let Book_Author = req.body.Book_Author;
      let Language_Code = req.body.Language_Code;
      let Year_Of_Publication = req.body.Year_Of_Publication;
      let Genres = req.body.Genres;
      let Description = req.body.Description;
      let Image_URL = req.body.Image_URL;
      let Rating = req.body.Rating;

      Data_insert("INSERT INTO booker.books_table (`ISBN`, `Book_Title`, `Book_Author`, `Year_Of_Publication`, `Language_Code`, `Genres`, `Description`, `Image_URL`, `Rating`) VALUES (" + "'" + ISBN + "'," + "'" + Book_Title + "'," + "'" + Book_Author + "'," + "'" + Year_Of_Publication + "'," + "'" + Language_Code + "'," + "'" + Genres + "'," + "'" + Description + "'," + "'" + Image_URL + "'," + "'" + Rating + "')").then(() =>
      {
          res.render("successful-page", {PageTitle: 'Book Added Successfuly', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
      });
  });



module.exports = router;