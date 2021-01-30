const express = require("express");
const db = require("../models/Database_Connection");
const Data_extractor = require("../models/Data_extraction");
const Data_insert = require("../models/Data_insert");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
var router = express.Router();
const path = require('path');
const recommendation = require("../Recommendation System/recommendation_connection.js");

let genres = ["Biographies",
    "Buisness",
    "Literature",
    "Science Fiction",
    "Children",
    "Fantasy",
    "Humor",
    "History",
    "Romance",
    "Mystery",
]

// APPLY COOKIE SESSION MIDDLEWARE
router.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge:  3600 * 1000 // 1hr
  }));

  // DECLARING CUSTOM MIDDLEWARE
  const ifNotLoggedin = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.render('login-register', { PageTitle: 'login-register', name: "", isAuthenticated: req.session.isLoggedIn});
    }
    next();
  }

  const ifLoggedin = (req,res,next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/index');
    }
    next();
  }
  // END OF CUSTOM MIDDLEWARE

  // ROOT PAGE
  router.get('/', ifNotLoggedin, (req,res,next) => {
      db.execute("SELECT `name` , `is_admin` FROM `users_table` WHERE `user_id`=?",[req.session.userID])
    .then(([rows]) => {
      console.log("route ran and changed username")
      var name = rows[0].name;
      console.log("current user id: " + req.session.userID); // CMT
      console.log("current username: " + name); // CMT

        res.render('index', {
            PageTitle: 'Booker',
            name: rows[0].name,
            is_admin: rows[0].is_admin,
            isAuthenticated: req.session.isLoggedIn
        });
    /* Start of website pages */
        //view Home page
        router.get("/index", (req, res, next) =>
        {
            res.render("index", {PageTitle: 'Booker', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});

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
                    res.render("products", {PageTitle: PageTitle, page_number: page_number, genres: genres, books: data[0], max_pages_count: max_pages_count, no_of_books: data[1], err: data[2], name: name /*CMT*/, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
                });
            });
        });

        //view Single Book Page with recommendation
        router.get("/book/:productId", (req, res, next) =>
        {
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
                        res.render("product-single", {PageTitle: data[0][0].Book_Title, books: data[0], no_of_books: data[1], err: data[2], name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
                        console.log("dataTest = ", data[0][0].Book_Title);
                    });
                });
            });

        });

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

          //  res.send('done')
            //[CMT, removed this part]
            // Data_extractor('SELECT * FROM booker.books_table where book_id IN (' + book_id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + "," + recommended_books_ids[4] + "," + recommended_books_ids[5] + ")" + 'ORDER BY FIELD(book_id,' + book_id + "," + recommended_books_ids[0] + "," + recommended_books_ids[1] + "," + recommended_books_ids[2] + "," + recommended_books_ids[3] + "," + recommended_books_ids[4] + "," + recommended_books_ids[5] + ")").then((data) =>
            // {
            //     res.render("product-single", { PageTitle: data[0][0].Book_Title, books: data[0], no_of_books: data[1], err: data[2],name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            // });
        });

        //get type of books
        router.get("/Genres/:genre", (req, res, next) =>
        {
            let genre = req.params.genre;

            Data_extractor('select * from booker.books_table where Genres LIKE' + "'%" + genre + "%'").then((data) =>
            {
                res.render("genres", {PageTitle: genre, books: data[0], genres: genres, no_of_books: data[1], err: data[2], name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            });
        });

        //view all books
        router.get("/Available-Books", (req, res, next) =>
        {
            Data_extractor('select * from booker.books_table').then((data) =>
            {
                res.render("Available-Books", {PageTitle: 'Available Books', books: data[0], no_of_books: data[1], err: data[2], name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            });

        });

        //get top 10 rated books
        router.get("/Top-Rated", (req, res, next) =>
        {
            Data_extractor("SELECT * FROM booker.books_table where Rating >= '4' LIMIT 10").then((data) =>
            {
                res.render("Top-Rated", {PageTitle: 'Top Rated', books: data[0], genres: genres, no_of_books: data[1], err: data[2], name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            });
        });

        //search for specific product
        router.get("/search/:searched_book_name", (req, res, next) =>
        {
            let searched_book_name = req.params.searched_book_name;
            let PageTitle = 'Search For ' + searched_book_name;
            Data_extractor('select * from booker.books_table where Book_Title LIKE' + "'%" + searched_book_name + "%'").then((data) =>
            {
                res.render("genres", {PageTitle: PageTitle, genres: genres, books: data[0], no_of_books: data[1], err: data[2], name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            });
        });

        //view privacy-policy page
        router.get("/privacy-policy", (req, res, next) =>
        {
            res.render("privacy-policy", {PageTitle: 'Privacy Policy', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
        });

        //view term condition page
        router.get("/terms-conditions", (req, res, next) =>
        {
            res.render("terms-conditions", {PageTitle: 'Terms Conditions', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
        });

        //view faq page
        router.get("/faq", (req, res, next) =>
        {
            res.render("faq", {PageTitle: 'FAQ', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
        });

        //view contact us page
        router.get("/contact", (req, res, next) =>
        {
            res.render("contact", {PageTitle: 'Contact', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
        });

        //view about page
        router.get("/about", (req, res, next) =>
        {
            res.render("about", {PageTitle: 'About', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
        });

        //view GwentGame page
        router.get("/GwentGame", (req, res, next) =>
        {
            res.render("Gwent");
        });

        if (rows[0].is_admin == 1)
        {
            // Add new book to database page accessable only by admin users
            router.get("/add-new-book", (req, res, next) =>
            {
                res.render("add-new-book", {PageTitle: 'Add New Book To Database', genres: genres, name: rows[0].name,is_admin: rows[0].is_admin,isAuthenticated: req.session.isLoggedIn});
            });
        };

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
                res.render("successful-page", {PageTitle: 'Book Added Successfuly', name: rows[0].name, is_admin: rows[0].is_admin, isAuthenticated: req.session.isLoggedIn});
            });
        });



    /* End of website pages*/
    });

  });// END OF ROOT PAGE


  // REGISTER PAGE
  router.post('/register', ifLoggedin,
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

  // LOGIN PAGE
  router.post('/', ifLoggedin, [
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
    const {user_pass, user_email} = req.body;
    if(validation_result.isEmpty()){

        db.execute("SELECT * FROM `users_table` WHERE `email`=?",[user_email])
        .then(([rows]) => {
            // console.log(rows[0].password);
            bcrypt.compare(user_pass, rows[0].password).then(compare_result => {
                if(compare_result === true){
                  // CMT
                    req.session.isLoggedIn = true;
                    req.session.userID = rows[0].user_id;
                    req.session.name = rows[0].name;
                    req.session.is_admin = rows[0].is_admin;
                    res.redirect('/');
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

  // LOGOUT
  router.get('/logout',(req,res)=>{
    //session destroy
    req.session = null;
    res.redirect('/');
  });
  // END OF LOGOUT


  module.exports = router;
