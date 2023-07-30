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
//check additional slots available when an illegal booking is made. How to stop illegal bookings from the participants table.
//need a new booking type which is for blocking out time for any resource
//Edit base availability (add more or remove some)
//Stop the base schedules from being populated every time the server starts
//Favicon

//TODO: 
//nurse1 and nurse2
//What happens with autobook if there is a week missing for the psychologist? ---> it lets you book it. Need to prevent this.
//shift all appointments x weeks option
//Show appointment details in modal: start/end times for each resource and participant
//Authentication?

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
const DB_PATH = path.join(__dirname, 'project-database.db');

const availableSlotscalculationService = require('./modules/availableSlotsCalculationService');
const appointmentService = require('./modules/appointmentService.js');
const schedulesService = require('./modules/schedulesService.js');
const { isResourceAvailable } = require('./modules/appointmentService');


// Define the formatTime helper
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
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${year} ${months[parseInt(month, 10) - 1]} ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

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

//Global constnats
app.locals.siteName = "Booking App";

const psychologistIds = [
  { id: 7, name: "Psychologist1" },
  { id: 8, name: "Psychologist2" },
  { id: 9, name: "Psychologist3" },
  { id: 10, name: "Psychologist4" },
  { id: 11, name: "Psychologist5" },
  { id: 12, name: "Psychologist6" },
  { id: 13, name: "Psychologist7" },
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


    // await db.run(`DELETE FROM schedules WHERE id = ?`, scheduleId);

    res.json({ message: "Successfully deleted schedules" })
  } catch (err) {
    console.error('Failed to delete schedules:', err);
    const errorMessage = err.message || "Failed to delete schedules";
    res.status(500).json({ error: errorMessage });
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
    const { startDate, endDate, appointmentNumber, psychologistName, roomName, researcherName, participantNumber } = req.query;


    //Populate dropdown options
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

    if (multiple_appointments == 'true') {

      for (let i = parseInt(appointmentNumber); i <= 8; i++) {
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
        date = moment(date).add(7, 'days').format('YYYY-MM-DD');
        appointmentNumber = i + 1;

      }
    }

    if (multiple_appointments == 'false') {

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

    res.json({ message: "Appointment created successfully" });
  } catch (err) {
    console.error('Failed to create appointment:', err);
    const errorMessage = err.message || "Failed to create appointment";
    res.status(500).json({ error: errorMessage });
  }
});


app.get("/participants", async (req, res) => {
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

    let arrangedData = Array(40).fill().map((_, i) => ({
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



// Start the server running.
app.listen(port, hostname, function () {
  console.log(`App listening on ${hostname}!`);
});