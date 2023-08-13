const fs = require("fs");
const moment = require('moment');
const { off } = require("process");
const appointmentConfig = JSON.parse(fs.readFileSync('./config/appointmentRules.json', 'utf8'));

async function createAppointment(db, participantName, researcherName, nurseName, psychologistName, roomName, appointmentName, date, startTime) {

  startTime = date + ' ' + startTime;

  const researcherRow = await db.get('SELECT id FROM bookable_things WHERE name = ?', [researcherName]);
  const researcher_id = researcherRow ? researcherRow.id : null;

  const nurseRow = await db.get('SELECT id FROM bookable_things WHERE name = ?', [nurseName]);
  const nurse_id = nurseRow ? nurseRow.id : null;

  const psychologistRow = await db.get('SELECT id FROM bookable_things WHERE name = ?', [psychologistName]);
  const psychologist_id = psychologistRow ? psychologistRow.id : null;

  const roomRow = await db.get('SELECT id FROM bookable_things WHERE name = ?', [roomName]);
  const room_id = roomRow ? roomRow.id : null;

  let appointment_number = parseInt(appointmentName)
  let participant_id = participantName

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
    end_time = moment(startTime).add(180, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm')
  } else if (appointment_type_id === 2) {
    end_time = moment(startTime).add(390, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm')
  } else if (appointment_type_id === 3) {
    end_time = moment(startTime).add(150, 'minutes')
    end_time = end_time.format('YYYY-MM-DD HH:mm')
  }

  try {
    // First, insert into the appointments table
    let result = await db.run(
      "INSERT INTO appointments (participant_id, appointment_number, start_time, end_time) VALUES (?, ?, ?, ?)",
      [participant_id, appointment_number, startTime, end_time]
    );

    // Get the id of the appointment just inserted
    let appointment_id = result.lastID;

    // Array of bookable things
    let bookable_things = [researcher_id, nurse_id, psychologist_id, room_id];

    // Loop through each bookable thing and insert into the booked_times table
    for (let i = 0; i < bookable_things.length; i++) {
      if (!bookable_things[i]) {
        continue;
      }

      let bookableThingRow = await db.get('SELECT name FROM bookable_things WHERE id = ?', [bookable_things[i]]);


      let { newStartTime, newEndTime } = adjustTimes(appointment_type_id, bookable_things[i], startTime, end_time);

      await db.run(
        "INSERT INTO booked_times (appointment_id, bookable_thing_id, booked_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
        [appointment_id, bookable_things[i], bookableThingRow.name, newStartTime, newEndTime]
      );
    }


  } catch (error) {
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Implementation code for calculating start and end times
function calculateTime(resource, appointmentType, originalStartTime) {

  resource = resource.toLowerCase();
  let offset = appointmentConfig[`type${appointmentType}`][`${resource}Offset`];
  console.log(offset)
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
    resource = 'Researcher';
  } else if (resourceId === 3 || resourceId === 4) {
    resource = 'Nurse';
  } else if ([7, 8, 9, 10, 11, 12, 13].includes(resourceId)) {
    resource = 'Psychologist';
  } else if (resourceId === 4 || resourceId === 5 || resourceId === 6) {
    resource = 'Room';
  }

  // Calculate the new start and end times
  console.log(resource, appointmentType, originalStartTime)
  let result = calculateTime(resource, appointmentType, originalStartTime);


  // Return the new start and end times
  return { newStartTime: result.calculatedStartTime, newEndTime: result.calculatedEndTime };
}

async function isResourceAvailable(db, resourceName, appointmentNumber, startTime) {

  let appointmentType;

  if (appointmentNumber == 1 || appointmentNumber == 2) {
    appointmentType = appointmentNumber;
  } else if (appointmentNumber == 3 || appointmentNumber == 4 || appointmentNumber == 5 || appointmentNumber == 6 || appointmentNumber == 7 || appointmentNumber == 8) {
    appointmentType = 3;
  } else {
    throw new Error('Invalid appointment number');
  }

  const resourceType = resourceName.slice(0, -1).toLowerCase();
  const calculatedResourceTimes = calculateTime(resourceType, appointmentType, startTime)

  const resourceStartTime = calculatedResourceTimes.calculatedStartTime;
  const resourceEndTime = calculatedResourceTimes.calculatedEndTime;
  const resourceDate = resourceStartTime.split(' ')[0];

  const resourceIdRow = await db.get('SELECT id FROM bookable_things WHERE name = ?', [resourceName]);
  const sameDaySchedule = await db.get(`SELECT * FROM schedules WHERE bookable_thing_id = ? AND strftime('%Y-%m-%d', start_time) = ?`, [resourceIdRow.id, resourceDate]);
  const sameDayAppointments = await db.get(`SELECT * FROM booked_times WHERE bookable_thing_id = ? AND strftime('%Y-%m-%d', start_time) = ?`, [resourceIdRow.id, resourceDate]);

  //If now schedule available for resource on the same day, throw an error
  if (!sameDaySchedule) {
    throw new Error(`No availability schedule found for ${resourceName} on ${resourceDate}`);
  }

  //If the resource is available on the required day and their are no appointments on the same day, check if the required appointment time is within he start and end times of the resource schedule
  if (!sameDayAppointments) {
    var slotCalculationResult = isSlotAvailable(resourceStartTime, resourceEndTime, sameDaySchedule.start_time, sameDaySchedule.end_time);
  } else {
    //TODO: implement logic to check if the required appointment time is within he start and end times of the resource schedule and also outside existing appointments
    return false;

  }

  if (!slotCalculationResult) {
    throw new Error(`The ${resourceName} is not available at ${resourceStartTime} on ${resourceDate}`);
  }
  return slotCalculationResult

}

function isSlotAvailable(resourceStartTime, resourceEndTime, scheduleStartTime, scheduleEndTime) {

  //Remove date component from the time strings
  const resourceStartDateTime = new Date(resourceStartTime);
  const resourceEndDateTime = new Date(resourceEndTime);

  const scheduleStartDateTime = new Date(scheduleStartTime);
  const scheduleEndDateTime = new Date(scheduleEndTime);

  // Implement logic to check if the slot is available
  if (resourceStartDateTime < scheduleStartDateTime || resourceEndDateTime > scheduleEndDateTime) {
    return false;
  }

  return true;
}

module.exports = {
  createAppointment,
  calculateTime,
  isResourceAvailable
};