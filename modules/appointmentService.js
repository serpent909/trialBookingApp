const fs = require("fs");
const moment = require('moment');
const appointmentConfig = JSON.parse(fs.readFileSync('./config/appointmentRules.json', 'utf8'));

async function createAppointment(db, participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_number, start_time) {


  let end_time;
  let appointment_type_id;

  if (appointment_number === 1) {
    appointment_type_id = 1;
  } else if (appointment_number === 2) {
    appointment_type_id = 2;
  } else if (appointment_number === 3) {
    appointment_type_id = 3;
  } else if (appointment_number === 4) {
    appointment_type_id = 3;
  } else if (appointment_number === 5) {
    appointment_type_id = 3;
  } else if (appointment_number === 6) {
    appointment_type_id = 3;
  } else if (appointment_number === 7) {
    appointment_type_id = 3;
  } else if (appointment_number === 8) {
    appointment_type_id = 3;
  }

  if (appointment_type_id === 1) {
    end_time = moment(start_time).add(180, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  } else if (appointment_type_id === 2) {
    end_time = moment(start_time).add(390, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  } else if (appointment_type_id === 3) {
    end_time = moment(start_time).add(150, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  }


  await db.run('BEGIN TRANSACTION');

  try {
    // First, insert into the appointments table
    let result = await db.run(
      "INSERT INTO appointments (participant_id, appointment_number, start_time, end_time) VALUES (?, ?, ?, ?)",
      [participant_id, appointment_number, start_time, end_time]
    );

    // Get the id of the appointment just inserted
    let appointment_id = result.lastID;

    // Array of bookable things
    let bookable_things = [researcher_id, nurse_id, psychologist_id, room_id];

    // Loop through each bookable thing and insert into the booked_times table
    for (let i = 0; i < bookable_things.length; i++) {
      if (appointment_type_id === 1 && !bookable_things[i]) {
        continue;
      }

      let bookableThingRow = await db.get('SELECT name FROM bookable_things WHERE id = ?', [bookable_things[i]]);


      let { newStartTime, newEndTime } = adjustTimes(appointment_type_id, bookable_things[i], start_time, end_time);

      await db.run(
        "INSERT INTO booked_times (appointment_id, bookable_thing_id, booked_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
        [appointment_id, bookable_things[i], bookableThingRow.name, newStartTime, newEndTime]
      );
    }

    await db.run('COMMIT');
  } catch (error) {
    // If any operation fails, rollback the transaction
    await db.run('ROLLBACK');
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Implementation code for calculating start and end times
function calculateTime(resource, appointmentType, originalStartTime) {

  let offset = appointmentConfig[`type${appointmentType}`][`${resource}Offset`];
  let duration = appointmentConfig[`type${appointmentType}`][`${resource}Duration`];
  let calculatedStartTime = moment(originalStartTime).add(offset, 'minutes').format('YYYY-MM-DD HH:mm');
  let calculatedEndTime = moment(calculatedStartTime).add(duration, 'minutes').format('YYYY-MM-DD HH:mm');

  return { calculatedStartTime, calculatedEndTime };
}

function adjustTimes(appointmentType, resourceId, originalStartTime) {

  // Implementation code for adjusting times
  let resource;

  // Determine the resource based on the resourceId
  if (resourceId === 1 || resourceId === 2) {
    resource = 'researcher';
  } else if (resourceId === 3) {
    resource = 'nurse';
  } else if ([7, 8, 9, 10, 11, 12, 13].includes(resourceId)) {
    resource = 'psychologist';
  } else if (resourceId === 4 || resourceId === 5 || resourceId === 6) {
    resource = 'room';
  }

  // Calculate the new start and end times
  let result = calculateTime(resource, appointmentType, originalStartTime);

  // Return the new start and end times
  return { newStartTime: result.calculatedStartTime, newEndTime: result.calculatedEndTime };
}

module.exports = {
  createAppointment,
  calculateTime
};