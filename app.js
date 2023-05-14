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


function calculateAvailableSlots(availabilityStart, availabilityEnd, resourceDayAppointmentArray) {
  const start = new Date(availabilityStart);
  const end = new Date(availabilityEnd);
  const availableSlots = [];

  let currentSlotStart = start;

  resourceDayAppointmentArray.forEach((appointment) => {
    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = new Date(appointment.end);

    if (currentSlotStart < appointmentStart) {
      const availableSlot = {
        start: currentSlotStart.toISOString(),
        end: appointmentStart.toISOString()
      };
      availableSlots.push(availableSlot);
    }

    currentSlotStart = appointmentEnd;
  });

  if (currentSlotStart < end) {
    const availableSlot = {
      start: currentSlotStart.toISOString(),
      end: end.toISOString()
    };
    availableSlots.push(availableSlot);
  }

  return availableSlots;
}



// APIs
app.get("/", (req, res) => {
  res.render("home", { title: "My Website" });
});


//get the base schedules of the resources
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


//get the remaining appointment availability
app.get("/appointmentAvailability", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    // Fetch the base availability information from the schedules table
    const baseAvailabilitys = await db.all("SELECT * FROM schedules");
    const bookedAppointments = await db.all("SELECT * FROM appointments");

    const availableSlots = [];

    baseAvailabilitys.forEach((baseAvailability) => {

      const resourceDayAppointmentArray = [];
      bookedAppointments.forEach((bookedAppointment) => {


        const appointmentDate = bookedAppointment.start_time.split("T")[0];
        const availabilityDate = baseAvailability.start_time.split("T")[0];

        if (appointmentDate === availabilityDate && (bookedAppointment.researcher_id === baseAvailability.bookable_thing_id || 
          bookedAppointment.room_id === baseAvailability.bookable_thing_id ||
          bookedAppointment.nurse_id === baseAvailability.bookable_thing_id ||
          bookedAppointment.psychologist_id === baseAvailability.bookable_thing_id )) {

          const appointmentStart = bookedAppointment.start_time;
          const appointmentEnd = bookedAppointment.end_time;

          const bookedTimes = {
            start: appointmentStart,
            end: appointmentEnd
          }

          resourceDayAppointmentArray.push(bookedTimes)
        }
      })

      let availableDaySlots = calculateAvailableSlots(baseAvailability.start_time, baseAvailability.end_time, resourceDayAppointmentArray)

      availableDaySlots.forEach((slot) => {

        availableSlots.push({
          id: baseAvailability.bookable_thing_id,
          name: baseAvailability.name,
          type: baseAvailability.type,
          start_time: slot.start,
          end_time: slot.end,

        })
      })
    })

    res.render("appointmentAvailability", {
      title: "Appointment Availability",
      availableSlots,
    });
  } catch (err) {
    console.error("Failed to retrieve appointment availability:", err);
    res
      .status(500)
      .render("error", {
        title: "Error",
        message: "Failed to retrieve appointment availability",
      });
  }
});


//Add an appointment to the database
app.post("/appointments", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const {
      participant_id,
      researcher_id,
      nurse_id,
      psychologist_id,
      room_id,
      appointment_type_id,
      start_time,
      end_time
    } = req.body;

    // Insert the new appointment into the appointments table
    await db.run(
      "INSERT INTO appointments (participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time]
    );

    res.status(200).send("Appointment created successfully");
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(500).send("Failed to create appointment");
  }
});



// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});