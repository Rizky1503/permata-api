const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

http.get(process.env.DOMAIN_CRONT_JOB+'api/v1/cront-job/expired-data-in-order', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data));
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});