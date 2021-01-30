const db = require("./Database_Connection");

function Data_insert (command)
{
    return new Promise((resolve, reject) =>
    {
        db.execute(command).then(() =>
        {
            resolve();
        })
            .catch(err =>
            {
                resolve(err);
            });
    });

}

module.exports = Data_insert;