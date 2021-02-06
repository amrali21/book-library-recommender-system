function recommedation(current_user_id)
{
    if (current_user_id == undefined)
    {
        current_user_id = (Math.floor(Math.random() * 240000) + 1);
    }
    else
    {
        current_user_id = current_user_id;
    }

    let user_id = current_user_id;
    let recommended_books_ids = [];
    let result;

    var spawn = require('child_process').spawn,
        py = spawn('D:/anaconda/envs/RecSys/python.exe', ['./Recommendation System/recommender system.py']),
        data = user_id,
        dataString = '';

    /*Here we are saying that every time our node application receives data from the python process output stream(on 'data'), we want to convert that received data into a string and append it to the overall dataString.*/

    py.stdout.on('data', function (data)
    {
      console.log("heyyyyyyyyy You! dataaaaaaa")
        dataString += data.toString();
        // delete '\r\n' text at the end of the string
        result = dataString.slice(0, dataString.length - 2);
        // converting recommended books from string to array
        recommended_books_ids = result.split(" ");

    });


    py.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });


    module.exports.rexx = new Promise(function (resolve, reject)
    {
        /*Once the stream is done (on 'end') we want to simply log the received data to the console.*/

        py.stdout.on('end', function ()
        {
          console.log("heyyyyyyyyy You! DONE " )

            resolve(recommended_books_ids);
        });

  
    });

    /*We have to stringify the data first otherwise our python process wont recognize it*/
    py.stdin.write(JSON.stringify(data));
    py.stdin.end();
}

exports.rec = recommedation;
