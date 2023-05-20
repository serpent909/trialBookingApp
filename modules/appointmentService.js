const fs = require("fs");
const moment = require('moment');
const appointmentConfig = JSON.parse(fs.readFileSync('./config/appointmentRules.json', 'utf8'));

async function createAppointment(db, participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time) {
  await db.run('BEGIN TRANSACTION');

  try {
    // First, insert into the appointments table
    let result = await db.run(
      "INSERT INTO appointments (participant_id, appointment_type_id, start_time, end_time) VALUES (?, ?, ?, ?)",
      [participant_id, appointment_type_id, start_time, end_time]
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
}

function calculateTime(resource, appointmentType, originalStartTime) {
  // Implementation code for calculating start and end times
  let offset = appointmentConfig[`type${appointmentType}`][`${resource}Offset`];
  let duration = appointmentConfig[`type${appointmentType}`][`${resource}Duration`];
  let calculatedStartTime = moment(originalStartTime).add(offset, 'minutes').format('YYYY-MM-DDTHH:mm');
  let calculatedEndTime = moment(calculatedStartTime).add(duration, 'minutes').format('YYYY-MM-DDTHH:mm');

  return { calculatedStartTime, calculatedEndTime };
}

function adjustTimes(appointmentType, resourceId, originalStartTime) {
  // Implementation code for adjusting times
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

module.exports = {
  createAppointment
};