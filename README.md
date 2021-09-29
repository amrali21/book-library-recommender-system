# Overview
A full-stack web application containing a book recommendation system used to build personalized recommendations. the technique used is Collaborative filtering which is used by some popular websites like: Amazon, Netflix, IMDB

# How it works
when the user clicks a book, the algorithm will recommend 6 books that the user might like. it will do that by predicting ratings for books the user hasn't rated, then it will display the highest predicted books to the user. I've used  Neighborhood-based Collaborative filtering (KNN) and I've compared the two methods (user-based and item-based) and item-based approach gave better performance. 

the recommendation code is written in python and is called from node.js with a child process.

# Dataset
Check book rating dataset [here](https://www.kaggle.com/arashnic/book-recommendation-dataset?select=Books.csv)

# Demo

[![IMAGE ALT TEXT HERE](
https://img.youtube.com/vi/umTNKdxcNYo/default.jpg
)](https://www.youtube.com/watch?v=umTNKdxcNYo)


