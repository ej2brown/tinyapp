const bodyParser = require("body-parser");
const express = require("express");

//server
const PORT = 8080;
const app = express();


//modularize routes
const indexRouter = require("./routes/index");


//setup middlewares and frameworks as the callback fn 
app.set("view engine", "ejs");



app.use("/", indexRouter);





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;