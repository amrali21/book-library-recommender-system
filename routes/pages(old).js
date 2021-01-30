/*const express = require("express");
const db = require("../models/Database_Connection");
const Data_extractor = require("../models/Data_extraction");
const Data_insert = require("../models/Data_insert");
var router = express.Router();
const path = require('path');
const recommendation = require("../Recommendation System/recommendation_connection.js");

let genres = ["Biographies",
  "Buisness",
  "Children",
  "Literature",
  "Science Fiction",
  "Children",
  "Fantasy",
  "Humor",
  "History",
  "Romance",
  "Mystery",
]

//view Home page
router.get("/index", (req, res, next) =>
{
  res.render("index");
});

//get products pages --> View books pages
router.get("/products/:page_number", (req, res, next) =>
{
  let page_number = req.params.page_number;

  let max_book_in_page = 24;

  if (page_number == 1)
  {
    PageTitle = 'Recently Added';
  }
  else
  {
    PageTitle = 'product page No.' + page_number;
  }

  Data_extractor('SELECT COUNT(book_id) as total FROM booker.books_table').then((max_pages_count) =>
  {
    max_pages_count = Math.ceil(max_pages_count[0][0].total/24);
    console.log(max_pages_count);
    Data_extractor('SELECT * FROM booker.books_table WHERE book_id BETWEEN' + " " + ((max_pages_count - page_number) * (max_book_in_page) + 1) + " " + 'AND' + " " + ((max_pages_count + 1 - page_number) * (max_book_in_page)) + " " + 'ORDER BY book_id DESC').then((data) =>
  {
      res.render("products", { PageTitle: PageTitle, page_number: page_number, genres: genres , books: data[0], max_pages_count: max_pages_count , no_of_books: data[1], err: data[2] });
    });
  });
});

//view Single Book Page with recommendation
router.get("/book/:productId", (req, res, next) =>
{
  let id = req.params.productId;

  const Books_recommended = new Promise((resolve) =>
  {
    recommendation.rec();
    resolve();
  });
  Books_recommended.then(() =>
  {
    recommendation.rexx.then((recommended_books_ids) =>
    {
      console.log("recommended_books_ids = ", recommended_books_ids);
      Data_extractor('SELECT * FROM booker.books_table where book_id IN (' + id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + ")" + 'ORDER BY FIELD(book_id,' + id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + ")").then((data) =>
      {
        res.render("product-single", { PageTitle: data[0][0].Book_Title, books: data[0], no_of_books: data[1], err: data[2] });
        console.log("dataTest = ", data[0][0].Book_Title);
      });
    });
  });

});

//get type of books
router.get("/Genres/:genre", (req, res, next) =>
{
  let genre = req.params.genre;

  Data_extractor('select * from booker.books_table where Genres LIKE' + "'%" + genre + "%'").then((data) =>
  {
    res.render("genres", { PageTitle: genre, books: data[0], genres: genres , no_of_books: data[1], err: data[2] });
    
  });
});

//view all books
router.get("/Available-Books", (req, res, next) =>
{
  Data_extractor('select * from booker.books_table').then((data) =>
  {
    res.render("Available-Books", { PageTitle: 'Available Books', books: data[0], no_of_books: data[1], err: data[2] });
  });

});

//get top 10 rated books
router.get("/Top-Rated", (req, res, next) =>
{
  Data_extractor("SELECT * FROM booker.books_table where Rating >= '4' LIMIT 10").then((data) =>
  {
    res.render("Top-Rated", { PageTitle: 'Top Rated', books: data[0], genres: genres, no_of_books: data[1], err: data[2] });
  });
});

//search for specific product
router.get("/search/:searched_book_name", (req, res, next) =>
{
  let searched_book_name = req.params.searched_book_name;
  let PageTitle = 'Search For ' + searched_book_name;
  Data_extractor('select * from booker.books_table where Book_Title LIKE' + "'%" + searched_book_name + "%'").then((data) =>
  {
    res.render("genres", { PageTitle: PageTitle, genres: genres, books: data[0], no_of_books: data[1], err: data[2] });
  });
});

//view privacy-policy page
router.get("/privacy-policy", (req, res, next) =>
{
  res.render("privacy-policy", { PageTitle: 'Privacy Policy' });
});

//view term condition page
router.get("/terms-conditions", (req, res, next) =>
{
  res.render("terms-conditions", { PageTitle: 'Terms Conditions' });
});

//view faq page
router.get("/faq", (req, res, next) =>
{
  res.render("faq" , { PageTitle: 'FAQ' });
});

//view contact us page
router.get("/contact", (req, res, next) =>
{
  res.render("contact", { PageTitle: 'Contact' });
});

//view about page
router.get("/about", (req, res, next) =>
{
  res.render("about", { PageTitle: 'About' });
});

//view GwentGame page
router.get("/GwentGame", (req, res, next) =>
{
  res.render("Gwent");
});

// Add new book to database page accessable only by admin users
router.get("/add-new-book", (req, res, next) =>
{
  res.render("add-new-book", { PageTitle: 'Add New Book To Database', genres: genres });
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

  Data_insert("INSERT INTO booker.books_table (`ISBN`, `Book_Title`, `Book_Author`, `Year_Of_Publication`, `Language_Code`, `Genres`, `Description`, `Image_URL`, `Rating`) VALUES (" + "'" + ISBN + "'," + "'" + Book_Title + "'," + "'" + Book_Author + "'," + "'" + Year_Of_Publication + "'," + "'" + Language_Code + "'," + "'" + Genres + "'," + "'" + Description + "'," + "'" + Image_URL + "'," + "'" + Rating + "')" ).then(() =>
  {
    res.render("successful-page", { PageTitle: 'Book Added Successfuly' });
  });
});

module.exports = router;*/