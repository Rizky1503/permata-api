const http = require('http');
const dotenv = require('dotenv');
var findConfig = require('find-config');
dotenv.config({ path: require('find-config')('.env') });

http.get(process.env.DOMAIN_CRONT_JOB+'api/v1/cront-job/reminder-bimbel-online-1-day', (resp) => {
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