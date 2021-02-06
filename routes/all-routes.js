const express = require("express");
var router = express.Router();

// ROUTES

const user_login_router = require('./users/login');
const user_register_router = require('./users/register');
const user_logout_router = require('./users/logout');

const site_info_router = require('./site-info');
const books_browsing_router = require('./books-browsing');


const book_recommendation_router = require('./single-book/book-recommendation');
const book_rating_router = require('./single-book/book-rating');

const add_new_book_router = require('./add-new-book');








  router.use(site_info_router);
  router.use(user_login_router);
  router.use(user_register_router);
  router.use(user_logout_router);
  router.use(books_browsing_router);

  router.use(book_recommendation_router);
  router.use(book_rating_router);
  router.use(add_new_book_router);



  module.exports = {router};


