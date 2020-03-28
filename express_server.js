/* - express.js is a node.js web server framework
   - allows us to make HTTP requests on port 8080
   - start the server by running node express_server.js in your terminal*/
const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');   //handles HTTP POST requests
const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');  // tells the express app to use EJS as its templating engine.
app.use(bodyParser.urlencoded({ extended: true }));  //setup body-parser middleware
app.use('/', indexRouter);     //modularize routes for endpoints starting with '/' 

//console.log that the server is active
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;