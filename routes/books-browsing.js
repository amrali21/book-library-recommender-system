const express = require("express");
var router = express.Router();
const Data_extractor = require("../models/Data_extraction");
let genres = require('./common/genres');

 router.get("/index", (req, res, next) =>
 {
     res.render("index", {PageTitle: 'Booker', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});

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
       console.log( "username on this page.. " + name)
         max_pages_count = Math.ceil(max_pages_count[0][0].total / 24);
         console.log(max_pages_count);
         Data_extractor('SELECT * FROM booker.books_table WHERE book_id BETWEEN' + " " + ((max_pages_count - page_number) * (max_book_in_page) + 1) + " " + 'AND' + " " + ((max_pages_count + 1 - page_number) * (max_book_in_page)) + " " + 'ORDER BY book_id DESC').then((data) =>
         {
             res.render("products", {PageTitle: PageTitle, page_number: page_number, genres: genres, books: data[0], max_pages_count: max_pages_count, no_of_books: data[1], err: data[2], name: req.session.name /*CMT*/, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
         });
     });
 });


 //get type of books
 router.get("/Genres/:genre", (req, res, next) =>
 {

     let genre = req.params.genre;

     Data_extractor('select * from booker.books_table where Genres LIKE' + "'%" + genre + "%'").then((data) =>
     {
         res.render("genres", {PageTitle: genre, books: data[0], genres: genres, no_of_books: data[1], err: data[2], name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
     });
 });

 //view all books
 router.get("/Available-Books", (req, res, next) =>
 {
     Data_extractor('select * from booker.books_table').then((data) =>
     {
         res.render("Available-Books", {PageTitle: 'Available Books', books: data[0], no_of_books: data[1], err: data[2], name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
     });

 });

 //get top 10 rated books
 router.get("/Top-Rated", (req, res, next) =>
 {
     Data_extractor("SELECT * FROM booker.books_table where Rating >= '4' LIMIT 10").then((data) =>
     {
         res.render("Top-Rated", {PageTitle: 'Top Rated', books: data[0], genres: genres, no_of_books: data[1], err: data[2], name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
     });
 });

 //search for specific product
 router.get("/search/:searched_book_name", (req, res, next) =>
 {
     let searched_book_name = req.params.searched_book_name;
     let PageTitle = 'Search For ' + searched_book_name;
     Data_extractor('select * from booker.books_table where Book_Title LIKE' + "'%" + searched_book_name + "%'").then((data) =>
     {
         res.render("genres", {PageTitle: PageTitle, genres: genres, books: data[0], no_of_books: data[1], err: data[2], name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
     });
 });


 module.exports = router;