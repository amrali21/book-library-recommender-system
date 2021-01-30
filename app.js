const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const pagesControl = require("./routes/pages");
const db = require("./models/Database_Connection");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.static(path.join(__dirname)));

app.use(express.static("views/images"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

const ejs = require("ejs");

app.set("view engine", "ejs");

app.set("views", "views");

app.use(pagesControl);

app.use((req, res) =>
{
  res.status(404).render("404 page", { PageTitle: 'Page Not Found' });
});

const server = http.createServer(app);

const port = process.env.port || 3000;

server.listen(port);
