const express = require("express");
const app = express();
const port = 3005;

const handlebars = require("express-handlebars");
const path = require("path");

// Setup Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Setup body-parser
app.use(express.urlencoded({ extended: false }));

// Setup express to parse JSON
app.use(express.json());

// Make the "public" folder available statically
app.use(express.static(path.join(__dirname, "public")));

// APIs
app.get("/", (req, res) => {
  res.render("home", { title: "My Website" });
});

// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
