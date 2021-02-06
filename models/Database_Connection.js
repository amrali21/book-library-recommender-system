const mysql2 = require("mysql2");

const pool = mysql2.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: "booker"
});



module.exports = pool.promise();