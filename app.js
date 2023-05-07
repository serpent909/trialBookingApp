const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const port = 3000;

const handlebars = require("express-handlebars");
const path = require("path");
const DB_PATH = path.join(__dirname, 'project-database.db');

// Define the formatTime helper
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    helpers: {
      formatTime: function (dateTime) {
        const date = new Date(dateTime);
        const options = {
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        };
        return date.toLocaleString('en-US', options);
      },
      gt: function (value1, value2) {
        return value1 > value2;
      },
      lt: function (value1, value2) {
        return value1 < value2;
      },
      subtract: function (value1, value2) {
        return value1 - value2;
      },
      add: function (value1, value2) {
        return value1 + value2;
      }
    }
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

// Require and run database.js
require("./modules/database.js");

// APIs
app.get("/", (req, res) => {
  res.render("home", { title: "My Website" });
});

app.get("/schedules", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    let page = parseInt(req.query.page) || 1; // Convert the page number to an integer (default: 1)
    const limit = 100; // Number of rows to display per page
    const offset = (page - 1) * limit; // Calculate the offset

    // Fetch the schedules for the current page with LIMIT and OFFSET
    const schedules = await db.all(`SELECT * FROM schedules LIMIT ${limit} OFFSET ${offset}`);

    // Count the total number of schedules
    const countResult = await db.get('SELECT COUNT(*) AS count FROM schedules');
    const totalSchedules = countResult.count;

    const totalPages = Math.ceil(totalSchedules / limit); // Calculate the total number of pages

    res.render("schedules", { title: "My Website", schedules, page, totalPages });
  } catch (err) {
    console.error('Failed to retrieve schedules:', err);
    res.status(500).render("error", { title: "Error", message: "Failed to retrieve schedules" });
  }
});

// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});