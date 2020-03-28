const express = require("express");
const app = express();
const bodyParser = require("body-parser");

//server
const PORT = 8080;

//modularize routes
const indexRouter = require("./routes/index");

//setup middlewares and frameworks as the callback fn 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", indexRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;