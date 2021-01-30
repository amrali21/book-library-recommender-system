const mysql2 = require("mysql2");

const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    password:"0000",
    database: "booker"
});



module.exports = pool.promise();