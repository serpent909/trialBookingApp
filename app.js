const moment = require("moment");
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const port = process.env.PORT || 3000;

const hostname = "0.0.0.0";
app.set("trust proxy", true);

const handlebars = require("express-handlebars");
const path = require("path");
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, 'project-database.db');

const availableSlotscalculationService = require('./modules/availableSlotsCalculationService');
const appointmentService = require('./modules/appointmentService.js');
const schedulesService = require('./modules/schedulesService.js');
const { isResourceAvailable } = require('./modules/appointmentService');
const basicAuth = require('express-basic-auth');


// Handlebnars helper functions
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    helpers: {
      formatTime: function (dateTime) {

        if (!dateTime) {
          return '';
        }

        const separator = dateTime.includes('T') ? 'T' : ' ';
        const [datePart, timePart] = dateTime.split(separator);
        const weekday = moment(datePart).format('ddd');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${weekday} ${day} ${months[parseInt(month, 10) - 1]}  ${year}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        return formattedDate;
      },
      getDate: function (dateTime) {
        const separator = dateTime.includes('T') ? 'T' : ' ';
        const [datePart, timePart] = dateTime.split(separator);
        const [year, month, day] = datePart.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      },
      getTime: function (dateTime) {
        const separator = dateTime.includes('T') ? 'T' : ' ';
        const [datePart, timePart] = dateTime.split(separator);
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        return formattedTime;
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
      },
      indexPlusOne: function (index) {
        return index + 1;
      }
    }
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

require("./modules/database.js");

//Global constants
app.locals.siteName = "PAM Trial Booking App";


// TODO: implement logic to look these up from the database
// const researcherIds = [
//   { id: 1, name: "Alesha" },
//   { id: 2, name: "Lucia" },
// ];

// const nurseIds = [
//   { id: 3, name: "Nurse1" },
//   { id: 4, name: "Nurse2" },
// ];

// const roomIds = [
//   { id: 5, name: "Room1" },
//   { id: 6, name: "Room2" },
// ]

// const psychologistIds = [
//   { id: 7, name: "Psychologist1" },
//   { id: 8, name: "Psychologist2" },
//   { id: 9, name: "Psychologist3" },
//   { id: 10, name: "Psychologist4" },
//   { id: 11, name: "Psychologist5" },
//   { id: 12, name: "Psychologist6" },
//   { id: 13, name: "Psychologist7" },
// ];


// app.locals.researcher_ids = researcherIds;
// app.locals.nurse_ids = nurseIds;
// app.locals.psychologist_ids = psychologistIds;
// app.locals.room_ids = roomIds;

app.locals.appointment_numbers = [1, 2, 3, 4, 5, 6, 7, 8];

const participantIds = Array.from({ length: 100 }, (_, i) => i + 1);
app.locals.participant_ids = participantIds

const session = require("express-session");

app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated
    return next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect("/login");
  }
};

// Authentication routes
app.get("/login", (req, res) => {
  res.render("login", { title: "Login to Booking App" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the provided username and password are correct
  if (username === "username" && password === "password") {
    // Successful authentication; store user information in the session
    req.session.user = username;
    res.redirect("/"); // Redirect to the root route
  } else {
    // Authentication failed; render the login form with an error message
    res.render("login", { title: "Login to Booking App", error: "Invalid credentials" });
  }
});

// Root route (requires authentication)
app.get("/", isAuthenticated, (req, res) => {
  const user = req.session.user;
  res.render("home", { title: "Booking App", user });
});


//get the base schedules of the resources
app.get("/schedules", isAuthenticated, async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    let { startDate, endDate, resourceName } = req.query;

    // Pagination
    let page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

    // Fetch all the resources
    const resources = await db.all(`SELECT * FROM bookable_things`);

    // Fetch the schedules for the current page with LIMIT and OFFSET
    const schedules = await db.all(`SELECT schedules.id AS scheduleId, schedules.*, bookable_things.* FROM schedules JOIN bookable_things ON schedules.bookable_thing_id = bookable_things.id`);

    const filteredSchedules = schedules.filter(schedule => {

      const scheduleStartDate = moment(schedule.start_time.split(' ')[0]).format('YYYY-MM-DD');
      const scheduleEndDate = moment(schedule.end_time.split(' ')[0]).format('YYYY-MM-DD');
      const scheduleResourceName = schedule.name;

      const isStartDateValid = startDate ? moment(startDate).isSameOrBefore(scheduleStartDate) : true;
      const isEndDateValid = endDate ? moment(endDate).isSameOrAfter(scheduleEndDate) : true;
      const isResourceNameValid = resourceName ? scheduleResourceName === resourceName : true;

      return isStartDateValid && isEndDateValid && isResourceNameValid;
    });

    // Count the total number of schedules
    const countResult = await db.get('SELECT COUNT(*) AS count FROM schedules');
    const totalSchedules = countResult.count;
    const totalPages = Math.ceil(totalSchedules / limit);

    res.render("schedules", { title: "Booking App", page, totalPages, resources, filteredSchedules });
  } catch (err) {
    console.error('Failed to retrieve schedules:', err);
    res.status(500).render("error", { title: "Error", message: "Failed to retrieve schedules" });
  }
});


app.post("/schedules", async (req, res) => {

  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const { startTime, endTime, startDate, endDate, resourceName, day } = req.body;

    const result = await schedulesService.addSchedules(db, startTime, endTime, startDate, endDate, day, resourceName);

    res.json({ message: "Successfully added schedules" })
  } catch (err) {
    console.error('Failed to add schedules:', err);
    const errorMessage = err.message || err;
    return res.status(500).json({ error: errorMessage });
  }
});


app.delete("/schedules", async (req, res) => {

  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const schedulesToDelete = req.body;

    for (const schedule of schedulesToDelete) {
      const scheduleId = parseInt(schedule);

      // Get the schedule details
      const scheduleRow = await db.get(
        `SELECT * FROM schedules WHERE id = ?`,
        scheduleId
      );

      if (!scheduleRow) {
        // Schedule not found, return an error response
        return res.status(404).json({
          error: `Schedule with ID ${scheduleId} not found.`,
        });
      }

      const date = scheduleRow.start_time.split(" ")[0];

      // Check if there are any appointments for the same date
      const hasAppointments = await db.get(
        `SELECT COUNT(*) AS count FROM booked_times WHERE bookable_thing_id = ? AND strftime('%Y-%m-%d', start_time) = ?`,
        scheduleRow.bookable_thing_id,
        date
      );

      if (hasAppointments.count > 0) {
        // There are appointments for this schedule date, so skip deletion and return an error response
        return res.status(400).json({
          error: `Cannot delete schedule with ID ${scheduleId}. There are existing appointments for the same date.`,
        });
      }

      // Delete the schedule
      await db.run(`DELETE FROM schedules WHERE id = ?`, scheduleId);
    }

    res.json({ message: "Successfully deleted schedules" })
  } catch (err) {
    console.error('Failed to delete schedules:', err);
    const errorMessage = err.message || "Failed to delete schedules";
    res.status(500).json({ error: errorMessage });
  }
});


//get the remaining appointment availability
app.get("/appointmentAvailability", isAuthenticated, async (req, res) => {

  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const { startDate, endDate, participantNumber, appointmentNumber, psychologistName, nurseName, roomName, researcherName } = req.query;

    //Populate dropdown options
    const rows = await db.all("SELECT name, type FROM bookable_things");
    const dropDownOptions = {
      roomNames: rows.filter(row => row.type === 'Room').map(row => row.name),
      nurseNames: rows.filter(row => row.type === 'Nurse').map(row => row.name),
      psychologistNames: rows.filter(row => row.type === 'Psychologist').map(row => row.name),
      researcherNames: rows.filter(row => row.type === 'Researcher').map(row => row.name)
    }

    // Fetch the base availability information from the schedules table
    const baseAvailabilitySchedules = await db.all(
      "SELECT schedules.*, bookable_things.* FROM schedules JOIN bookable_things ON schedules.bookable_thing_id = bookable_things.id"
    );

    const bookedTimes = await db.all("SELECT * FROM booked_times");
    const availableSlots = availableSlotscalculationService.populateAvailableSlots(baseAvailabilitySchedules, bookedTimes, startDate, endDate, appointmentNumber, researcherName, psychologistName, roomName, nurseName);
    const formattedTimeSlotsWithAppointmentNumberLogic = availableSlotscalculationService.formatTimeSlotsWithAppointmentNumberLogic(availableSlots, appointmentNumber)

    res.render("appointmentAvailability", {
      title: "Appointment Availability",
      availableSlots,
      dropDownOptions,
      formattedTimeSlotsWithAppointmentNumberLogic

    });
  } catch (err) {
    console.error("Failed to retrieve appointment availability:", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to retrieve appointment availability",
    });
  }
});


//Boook appointment(s)
app.post("/appointments", async (req, res) => {

  console.log(req.body)

  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    let {
      startTime,
      researcherName,
      psychologistName,
      roomName,
      nurseName,
      participantNumber,
      appointmentNumber,
      multiple_appointments,
      date
    } = req.body;

    // Check if booking is for multiple appointments
    if (multiple_appointments === 'true') {
      // Create an array to store all the appointments that need to be booked
      const appointmentsToBook = [];

      for (let i = parseInt(appointmentNumber); i <= 8; i++) {
        // Calculate the start time for the next appointment, one week apart
        let fullStartTime = moment(date + " " + startTime, "YYYY-MM-DD HH:mm");


        // Check if all resources are available at the calculated start time
        const resourcesAvailable = await Promise.all([
          researcherName && isResourceAvailable(db, researcherName, appointmentNumber, fullStartTime, 'Researcher'),
          nurseName && isResourceAvailable(db, nurseName, appointmentNumber, fullStartTime, 'Nurse'),
          psychologistName && isResourceAvailable(db, psychologistName, appointmentNumber, fullStartTime, 'Psychologist'),
          roomName && isResourceAvailable(db, roomName, appointmentNumber, fullStartTime, 'Room')
        ]);

        // If all resources are available, add the appointment details to the array
        appointmentsToBook.push({
          participantNumber,
          researcherName,
          nurseName,
          psychologistName,
          roomName,
          appointmentNumber,
          date,
          startTime
        });

        date = moment(date).add(7, 'days').format('YYYY-MM-DD');
        appointmentNumber = i + 1;
      }

      // If all the appointments are available, book them all at once inside a transaction
      await db.run('BEGIN TRANSACTION');

      try {
        for (const appointment of appointmentsToBook) {
          await appointmentService.createAppointment(
            db,
            appointment.participantNumber,
            appointment.researcherName,
            appointment.nurseName,
            appointment.psychologistName,
            appointment.roomName,
            appointment.appointmentNumber,
            appointment.date,
            appointment.startTime
          );
        }

        await db.run('COMMIT');
      } catch (error) {
        // If any operation fails, rollback the transaction
        await db.run('ROLLBACK');
        throw error; // Rethrow the error to be handled by the caller
      }
    } else {
      // For a single appointment, just book it directly
      await appointmentService.createAppointment(
        db,
        participantNumber,
        researcherName,
        nurseName,
        psychologistName,
        roomName,
        appointmentNumber,
        date,
        startTime
      );
    }

    res.json({ message: "Appointment(s) created successfully" });
  } catch (err) {
    console.error('Failed to create appointment:', err);
    const errorMessage = err.message || "Failed to create appointment";
    res.status(500).json({ error: errorMessage });
  }
});


app.get("/participants", isAuthenticated, async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const rows = await db.all("SELECT name, type FROM bookable_things");
    const dropDownOptions = {
      roomNames: rows.filter(row => row.type === 'Room').map(row => row.name),
      psychologistNames: rows.filter(row => row.type === 'Psychologist').map(row => row.name),
      researcherNames: rows.filter(row => row.type === 'Researcher').map(row => row.name)
    }

    const participantBookings = await db.all("SELECT * FROM appointments");

    let arrangedData = Array(100).fill().map((_, i) => ({
      participantId: i + 1,
      appointments: Array(8).fill(null)
    }));

    const bookingPromises = participantBookings.map(async booking => {

      let participantIndex = arrangedData.findIndex(participant => participant.participantId === booking.participant_id);
      let appointmentIndex = booking.appointment_number - 1;

      let appointmentPsychologistRow = await db.get(`SELECT * FROM booked_times WHERE appointment_id = ${booking.id} AND booked_name LIKE '%psychologist%'`);
      let psycholoigst = appointmentPsychologistRow ? appointmentPsychologistRow.booked_name : null;

      let appointmentResearcherRow = await db.get(`SELECT * FROM booked_times WHERE appointment_id = ${booking.id} AND booked_name LIKE '%researcher%'`);
      let researcher = appointmentResearcherRow ? appointmentResearcherRow.booked_name : null;

      if (participantIndex > -1) {
        arrangedData[participantIndex].appointments[appointmentIndex] =

        {
          startTime: booking.start_time,
          appointmentId: booking.id,
          psychologist: psycholoigst,
          researcher: researcher,
        }

      } else {
        console.log(`Invalid participant id: ${booking.participant_id}`);
      }
    });

    await Promise.all(bookingPromises);

    res.render("participants", { title: "Participants", participantBookings, arrangedData, dropDownOptions });
  } catch (err) {
    console.error('Failed to retrieve participants:', err);
    res.status(500).render("error", { title: "Error", message: "Failed to retrieve participants" });
  }

});


app.delete("/appointments/:id", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const { id } = req.params;

    await db.run(`DELETE FROM booked_times WHERE appointment_id =?`, id)
    await db.run(`DELETE FROM appointments WHERE id = ?`, id);

    res.status(200).json({ message: "Appointment deleted successfully" });

  } catch (err) {
    console.error('Failed to delete appointment:', err);
    res.status(500).send("Failed to delete appointment");
  }
});

app.get("/bookedTimes/:id", async (req, res) => {

  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const { id } = req.params;

    const bookedTimes = await db.all(`SELECT * FROM booked_times WHERE appointment_id = ?`, id);

    res.json(bookedTimes);

  }
  catch (err) {
    console.error('Failed to retrieve booked time:', err);
    res.status(500).send("Failed to retrieve booked time");
  }
});


// Start the server running.
app.listen(port, hostname, function () {
  console.log(`App listening on ${hostname}!`);
});