if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const all_routes = require("./routes/all-routes").router;

// middlewares
app.use(express.static(path.join(__dirname)));
app.use(express.static("views/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.set("view engine", "ejs");
app.set("views", "views");

// APPLY COOKIE SESSION MIDDLEWARE

const session_keys = process.env.SESSION_KEYS.split(',');
app.use(cookieSession({
  name: 'session',
  keys: [session_keys[0], session_keys[1]],
  maxAge:  3600 * 1000 // 1hr
}));

app.use(all_routes);

app.use((req, res) =>
{
  console.log('route not found');
  res.status(404).render("404 page", { PageTitle: 'Page Not Found' });
});

const server = http.createServer(app);
const port = process.env.port || 3000;

server.listen(port);
