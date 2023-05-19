//DONE:
//Restructure SQL tables to remove repitition of id's
//Reactor code to use new tables
//Time and date formatting


//TODO: 

//Add logic to store appointment times in the db for each resource based on the main appointment time and type
//Refactor code with improved naming conventions and seperation of concerns
//Add logic to prevent double booking of resources
//Improve available appointments view by incorporating appointment type logic and participant id
//Potentially generate available slots in 15-minute increments?
//Add participant view to display their current boking information, make it obvious which appointment needs to be booked next
//Potentially add a book time button from the participant vbiew page to populate the booking form with the correct information
//Edit existing bookings
//Edit base availability (add more or remove some)
//Authentication?
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const port = 3000;
const fs = require("fs");
const appointmentConfig = JSON.parse(fs.readFileSync('./config/appointmentRules.json', 'utf8'));

const moment = require('moment');

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


        const [datePart, timePart] = dateTime.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const formattedDate = `${months[parseInt(month, 10) - 1]} ${day}, ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

        return formattedDate;
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
    const { startDate, endDate, researcherTime, nurseTime, psychologistTime, roomTime, psychologistName, roomName } = req.query;


    // Fetch the base availability information from the schedules table
    const baseAvailabilitySchedules = await db.all(
      "SELECT schedules.*, bookable_things.* FROM schedules JOIN bookable_things ON schedules.bookable_thing_id = bookable_things.id"
    );
    const bookedTimes = await db.all("SELECT * FROM booked_times");

    const availableSlots = [];

   console.log(baseAvailabilitySchedules)

    const filteredBookedTimes = bookedTimes.map(appointment => ({
      ...appointment,
      appointmentDate: appointment.start_time.split("T")[0],
    }));



    baseAvailabilitySchedules.forEach((baseSchedule) => {
      const resourceDayAppointmentArray = filteredBookedTimes
        .filter(appointment =>
          appointment.appointmentDate === baseSchedule.start_time.split("T")[0] && appointment.bookable_thing_id === baseSchedule.bookable_thing_id
        ).map(({ start_time, end_time }) => ({ start: start_time, end: end_time }));

  

      let availableDaySlots = calculateAvailableSlots(
        baseSchedule.type,
        baseSchedule.name,
        baseSchedule.start_time,
        baseSchedule.end_time,
        resourceDayAppointmentArray
      );



      availableDaySlots = filterSlots(
        startDate,
        endDate,
        availableDaySlots,
        researcherTime,
        nurseTime,
        psychologistTime,
        roomTime,
        psychologistName,
        roomName
      );


      availableDaySlots.forEach((slot) => {
        availableSlots.push({
    
          id: baseSchedule.bookable_thing_id,
          name: baseSchedule.name,
          type: baseSchedule.type,
          start_time: slot.start,
          end_time: slot.end,
        });
      });
    });

    //update this with a function rather than hardcoding the options
    const rows = await db.all("SELECT name, type FROM bookable_things");
    const dropDownOptions = {
      roomNames: rows.filter(row => row.type === 'Room').map(row => row.name),
      psychologistNames: rows.filter(row => row.type === 'Psychologist').map(row => row.name),
    }

    res.render("appointmentAvailability", {
      title: "Appointment Availability",
      availableSlots,
      dropDownOptions,

    });
  } catch (err) {
    console.error("Failed to retrieve appointment availability:", err);
    res.status(500).render("error", {
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

    let {
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
    await db.run('BEGIN TRANSACTION');

    try {
      // First, insert into the appointments table
      let result = await db.run(
        "INSERT INTO appointments (participant_id, appointment_type_id, start_time, end_time) VALUES (?, ?, ?, ?)",
        [participant_id, appointment_type_id, start_time, end_time]
      );

      // Get the id of the appointment just inserted
      let appointment_id = result.lastID;


      // Helper function to calculate the start and end times
      function calculateTime(resource, appointmentType, originalStartTime) {
        let offset = appointmentConfig[`type${appointmentType}`][`${resource}Offset`];
        let duration = appointmentConfig[`type${appointmentType}`][`${resource}Duration`];
        let calculatedStartTime = moment(originalStartTime).add(offset, 'minutes').format('YYYY-MM-DDTHH:mm');
        let calculatedEndTime = moment(calculatedStartTime).add(duration, 'minutes').format('YYYY-MM-DDTHH:mm');

        return { calculatedStartTime, calculatedEndTime };
      }

      // Main function to adjust the times
      function adjustTimes(appointmentType, resourceId, originalStartTime) {
        let resource;

        // Determine the resource based on the resourceId
        if (resourceId === 1) {
          resource = 'researcher';
        } else if (resourceId === 2) {
          resource = 'nurse';
        } else if ([5, 6, 7, 8, 9, 10, 11, 12].includes(resourceId)) {
          resource = 'psychologist';
        } else if (resourceId === 3 || resourceId === 4) {
          resource = 'room';
        }

        // Calculate the new start and end times
        let result = calculateTime(resource, appointmentType, originalStartTime);

        // Return the new start and end times
        return { newStartTime: result.calculatedStartTime, newEndTime: result.calculatedEndTime };
      }

      // Array of bookable things
      let bookable_things = [researcher_id, nurse_id, psychologist_id, room_id];


      // Loop through each bookable thing and insert into the booked_times table
      for (let i = 0; i < bookable_things.length; i++) {

        if (appointment_type_id === 1 && !bookable_things[i]) {
          continue;
        }

        let { newStartTime, newEndTime } = adjustTimes(appointment_type_id, bookable_things[i], start_time, end_time);
      

        await db.run(
          "INSERT INTO booked_times (appointment_id, bookable_thing_id, start_time, end_time) VALUES (?, ?, ?, ?)",
          [appointment_id, bookable_things[i], newStartTime, newEndTime]
        );
      }

      await db.run('COMMIT');
    } catch (error) {
      // If any operation fails, rollback the transaction
      await db.run('ROLLBACK');
      throw error; // Rethrow the error to be handled by the caller
    }

    res.status(200).send("Appointment created successfully");
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(500).send("Failed to create appointment");
  }
});


app.get("/book-appointment", (req, res) => {
  res.render("bookAppointment", { title: "Book Appointment" });
});


// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});






function filterSlots(startDate, endDate, availableDaySlots, researcherTime, nurseTime, psychologistTime, roomTime, psychologistName, roomName) {

  if (startDate && endDate) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotDate = slot.start.split("T")[0];
      return slotDate >= startDate && slotDate <= endDate;
    });
  }


  if (researcherTime) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;

      if (slotType === "Researcher") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);

        return (slotEnd - slotStart) >= researcherTime * 60 * 60 * 1000;
      } else {
        return true;
      }

    });
  }

  if (nurseTime) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;

      if (slotType === "Nurse") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        console.log((slotEnd - slotStart) >= nurseTime * 60 * 60 * 1000)
        return (slotEnd - slotStart) >= nurseTime * 60 * 60 * 1000;
      } else {
        return true;
      }
    });
  }

  if (psychologistTime) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;

      if (slotType === "Psychologist") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        return (slotEnd - slotStart) >= psychologistTime * 60 * 60 * 1000;
      } else {
        return true;
      }
    });
  }

  if (roomTime) {

    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;

      if (slotType === "Room") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
   
        return (slotEnd - slotStart) >= roomTime * 60 * 60 * 1000;
      } else {
        return true;
      }
    });
  }

  if (psychologistName) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotName = slot.name;
      const slotType = slot.type;
      if (slotType === "Psychologist") {
        return slotName === psychologistName;
      } else {
        return true;
      }
    });
  }

  if (roomName) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotName = slot.name;
      const slotType = slot.type;
      if (slotType === "Room") {
        return slotName === roomName;
      } else {
        return true;
      }
    });
  }
  return availableDaySlots;
}


function calculateAvailableSlots(availabilityType, availabilityName, availabilityStart, availabilityEnd, resourceDayAppointmentArray) {

  const start = moment(availabilityStart).format('YYYY-MM-DDTHH:mm');
  const end = moment(availabilityEnd).format('YYYY-MM-DDTHH:mm');
  const availableSlots = [];

  let currentSlotStart = start;

  resourceDayAppointmentArray.forEach((appointment) => {
    const appointmentStart = moment(appointment.start).format('YYYY-MM-DDTHH:mm');
    const appointmentEnd = moment(appointment.end).format('YYYY-MM-DDTHH:mm');

    if (currentSlotStart < appointmentStart) {
      const availableSlot = {
        type: availabilityType,
        name: availabilityName,
        start: currentSlotStart,
        end: appointmentStart
      };
      availableSlots.push(availableSlot);
    }

    if (currentSlotStart < appointmentEnd) {
      currentSlotStart = appointmentEnd;
    }
  });

  if (currentSlotStart < end) {
    const availableSlot = {
      type: availabilityType,
      name: availabilityName,
      start: currentSlotStart,
      end: end
    };
    availableSlots.push(availableSlot);
  }

  return availableSlots;
}