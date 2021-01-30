const db = require("./Database_Connection");
let db_data;
let no_of_books;

function Data_extractor (command)
{
    return new Promise((resolve, reject) =>
    {
        db.execute(command)
            .then(result =>
            {
                //console.log(result);
                db_data = result[0];
                no_of_books = Object.keys(db_data).length;
                resolve([db_data, no_of_books]);
                console.log(no_of_books);
            })
            .catch(err =>
            {
                console.error("Error : " + err.message);
                console.log("number of books: " + no_of_books);
                resolve([db_data, no_of_books, err.message]);
            });
    });
}

module.exports = Data_extractor;
