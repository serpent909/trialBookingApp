//DONE:
//Restructure SQL tables to remove repitition of id's
//Reactor code to use new tables
//Time and date formatting
//Add logic to store appointment times in the db for each resource based on the main appointment time and type
//Refactor code with improved naming conventions and seperation of concerns
//Add participant view to display their current boking information, make it obvious which appointment needs to be booked next
//Potentially add a book time button from the participant view page to populate the booking form with the correct information
//Improve available appointments view by incorporating appointment number logic
//Potentially generate available slots in 15-minute increments?
//Delete appointment
//For appointment three onwards:
//-auto book option

//TODO: 
//shift all appointments x weeks option
//need a new booking type which is for blocking out time for any resource

//Edit base availability (add more or remove some)
//room3 needs its own type

//Add logic to prevent double booking of resources/booking in unavailable times
//Something to change the future availability from x date but would also need to check impact on existing appointments
//Authentication?

const moment = require("moment");
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const port = 3000;

const handlebars = require("express-handlebars");
const path = require("path");
const DB_PATH = path.join(__dirname, 'project-database.db');

const availableSlotscalculationService = require('./modules/availableSlotsCalculationService');
const appointmentService = require('./modules/appointmentService.js');

// Define the formatTime helper
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    helpers: {
      formatTime: function (dateTime) {

        const separator = dateTime.includes('T') ? 'T' : ' ';
        const [datePart, timePart] = dateTime.split(separator);
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${year} ${months[parseInt(month, 10) - 1]} ${day}, ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

        return formattedDate;
      },
      getDate: function (dateTime) {
        const separator = dateTime.includes('T') ? 'T' : ' ';
        const [datePart, timePart] = dateTime.split(separator);
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${day}  ${months[parseInt(month, 10) - 1]} ${year}`;
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

//Global constnats
app.locals.siteName = "Booking App";

const psychologistIds = [
  { id: 7, name: "Psychologist 1" },
  { id: 8, name: "Psychologist 2" },
  { id: 9, name: "Psychologist 3" },
  { id: 10, name: "Psychologist 4" },
  { id: 11, name: "Psychologist 5" },
  { id: 12, name: "Psychologist 6" },
  { id: 13, name: "Psychologist 7" },
];

const roomIds = [
  { id: 4, name: "Room 1" },
  { id: 5, name: "Room 2" },
  { id: 6, name: "Room 3" },
]
const researcherIds = [
  { id: 1, name: "Researcher 1" },
  { id: 2, name: "Researcher 2" },
];

app.locals.researcher_ids = researcherIds;
app.locals.psychologist_ids = psychologistIds;
app.locals.room_ids = roomIds;
app.locals.appointment_numbers = [1, 2, 3, 4, 5, 6, 7, 8];

const participantIds = Array.from({ length: 40 }, (_, i) => i + 1);
app.locals.participant_ids = participantIds

// APIs
app.get("/", (req, res) => {
  res.render("home", { title: "Booking App" });
});


//get the base schedules of the resources
app.get("/schedules", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    // Pagination
    let page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

    // Fetch the schedules for the current page with LIMIT and OFFSET
    const schedules = await db.all(`SELECT schedules.*, bookable_things.* FROM schedules JOIN bookable_things ON schedules.bookable_thing_id = bookable_things.id LIMIT ${limit} OFFSET ${offset}`);

    // Count the total number of schedules
    const countResult = await db.get('SELECT COUNT(*) AS count FROM schedules');
    const totalSchedules = countResult.count;
    const totalPages = Math.ceil(totalSchedules / limit);

    res.render("schedules", { title: "Booking App", schedules, page, totalPages });
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

    // Get the query parameters
    const { startDate, endDate, appointmentNumber, psychologistName, roomName, researcherName } = req.query;

    //populate dropdown options
    const rows = await db.all("SELECT name, type FROM bookable_things");
    const dropDownOptions = {
      roomNames: rows.filter(row => row.type === 'Room').map(row => row.name),
      psychologistNames: rows.filter(row => row.type === 'Psychologist').map(row => row.name),
      researcherNames: rows.filter(row => row.type === 'Researcher').map(row => row.name)
    }

    // Fetch the base availability information from the schedules table
    const baseAvailabilitySchedules = await db.all(
      "SELECT schedules.*, bookable_things.* FROM schedules JOIN bookable_things ON schedules.bookable_thing_id = bookable_things.id"
    );

    const bookedTimes = await db.all("SELECT * FROM booked_times");
    const availableSlots = availableSlotscalculationService.populateAvailableSlots(baseAvailabilitySchedules, bookedTimes, startDate, endDate, appointmentNumber, researcherName, psychologistName, roomName);
    const formattedTimeSlotsWithAppointmentNumberLogic = availableSlotscalculationService.formatTimeSlotsWithAppointmentNumberLogic(availableSlots, appointmentNumber);

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

    const nurse_id = 3;

    let {
      researcher_id,
      participant_id,
      psychologist_id,
      room_id,
      appointment_number,
      start_time,
      multiple_appointments
    } = req.body;

    if (multiple_appointments == 'true') {
      for (let i = parseInt(appointment_number); i <= 8; i++) {
        await appointmentService.createAppointment(
          db,
          parseInt(participant_id),
          parseInt(researcher_id),
          nurse_id,
          parseInt(psychologist_id),
          parseInt(room_id),
          parseInt(appointment_number),
          start_time
        );
        start_time = moment(start_time).add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
        appointment_number = i + 1;
        console.log(start_time)
      }
    }

    if (multiple_appointments == 'false') {
      //TODO: Tidy up parseInt
      await appointmentService.createAppointment(
        db,
        parseInt(participant_id),
        parseInt(researcher_id),
        nurse_id,
        parseInt(psychologist_id),
        parseInt(room_id),
        parseInt(appointment_number),
        start_time
      );
    }

    res.status(200).send("Appointment created successfully");
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(500).send("Failed to create appointment");
  }
});


app.get("/participants", async (req, res) => {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    const participantBookings = await db.all("SELECT * FROM appointments");

    let arrangedData = Array(40).fill().map((_, i) => ({
      participantId: i + 1,
      appointments: Array(8).fill(null)
    }));

    participantBookings.forEach((booking) => {
      let participantIndex = arrangedData.findIndex(participant => participant.participantId === booking.participant_id);
      let appointmentIndex = booking.appointment_number - 1;

      if (participantIndex > -1) {
        arrangedData[participantIndex].appointments[appointmentIndex] =

        {
          startTime: booking.start_time,
          appointmentId: booking.id
        }

      } else {
        console.log(`Invalid participant id: ${booking.participant_id}`);
      }
    });

    res.render("participants", { title: "Participants", participantBookings, arrangedData });

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


// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});