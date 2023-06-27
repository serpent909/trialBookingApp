const moment = require('moment');
const fs = require("fs");
const appointmentService = require('./appointmentService.js');
const appointmentRules = JSON.parse(fs.readFileSync('./config/appointmentRules.json', 'utf8'));

function filterSlots(startDate, endDate, availableDaySlots, appointmentNumber, researcherName, psychologistName, roomName) {


  let appointment_type_id;

  if (appointmentNumber == 1) {
    appointment_type_id = 1;
  } else if (appointmentNumber == 2) {
    appointment_type_id = 2;
  } else if (appointmentNumber == 3) {
    appointment_type_id = 3;
  } else if (appointmentNumber == 4) {
    appointment_type_id = 3;
  } else if (appointmentNumber == 5) {
    appointment_type_id = 3;
  } else if (appointmentNumber == 6) {
    appointment_type_id = 3;
  } else if (appointmentNumber == 7) {
    appointment_type_id = 3;
  } else if (appointmentNumber == 8) {
    appointment_type_id = 3;
  }


  if (startDate && endDate) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotDate = slot.start.split(" ")[0];
      return slotDate >= startDate && slotDate <= endDate;
    });
  }

  if (appointment_type_id === 1) {

    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;
      if (slotType === "Researcher") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Nurse") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Psychologist") {
        return false

      } else if (slotType === "Room") {
        return false
      }
    });
  } else if (appointment_type_id === 2) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;
      if (slotType === "Researcher") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Nurse") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Psychologist") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Room") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);
      }
    });
  } else if (appointment_type_id === 3) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotType = slot.type;
      if (slotType === "Researcher") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Nurse") {
        return false

      } else if (slotType === "Psychologist") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);

      } else if (slotType === "Room") {
        const slotStart = moment(slot.start);
        const slotEnd = moment(slot.end);
        const timeObject = appointmentService.calculateTime(slotType, appointment_type_id, slot.start);
        const calculateStart = moment(timeObject.calculatedStartTime)
        const calculateEnd = moment(timeObject.calculatedEndTime)
        return (slotEnd - slotStart) >= (calculateEnd - calculateStart);
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

  if (researcherName) {
    availableDaySlots = availableDaySlots.filter((slot) => {
      const slotName = slot.name;
      const slotType = slot.type;
      if (slotType === "Researcher") {
        return slotName === researcherName;
      } else {
        return true;
      }
    });
  }
  return availableDaySlots;
}


function calculateAvailableSlots(availabilityType, availabilityName, availabilityStart, availabilityEnd, resourceDayAppointmentArray) {

  const start = moment(availabilityStart).format('YYYY-MM-DD HH:mm');
  const end = moment(availabilityEnd).format('YYYY-MM-DD HH:mm');
  const availableSlots = [];

  let currentSlotStart = start;

  resourceDayAppointmentArray.forEach((appointment) => {
    const appointmentStart = moment(appointment.start).format('YYYY-MM-DD HH:mm');
    const appointmentEnd = moment(appointment.end).format('YYYY-MM-DD HH:mm');

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


function populateAvailableSlots(baseAvailabilitySchedules, bookedTimes, startDate, endDate, appointmnetNumber, researcherName, psychologistName, roomName) {

  const availableSlots = [];

  const filteredBookedTimes = bookedTimes.map(appointment => ({
    ...appointment,
    appointmentDate: appointment.start_time.split(" ")[0],
  }));

  baseAvailabilitySchedules.forEach((baseSchedule) => {
    const resourceDayAppointmentArray = filteredBookedTimes
      .filter(appointment =>
        appointment.appointmentDate === baseSchedule.start_time.split(" ")[0] && appointment.bookable_thing_id === baseSchedule.bookable_thing_id
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
      appointmnetNumber,
      researcherName,
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

  return availableSlots;

}

function formatTimeSlotsWithAppointmentNumberLogic(availableSlots, appointmentNumber) {
  const appointmentTypeRules = {
    1: "type1",
    2: "type2",
    3: "type3",
    4: "type3",
    5: "type3",
    6: "type3",
    7: "type3",
    8: "type3"
  };

  // Map appointment number to type
  const appointmentType = appointmentTypeRules[appointmentNumber];

  // Sort availableSlots by type and date
  const slotsByTypeAndDate = availableSlots.reduce((slots, slot) => {
    const date = slot.start_time.split(' ')[0];
    if (!slots[date]) slots[date] = {};
    if (!slots[date][slot.type]) slots[date][slot.type] = [];
    slots[date][slot.type].push(slot);
    return slots;
  }, {});

  const resourceDateCombinations = {};

  Object.entries(slotsByTypeAndDate).forEach(([date, resourcesByType]) => {
    const resourceTypes = Object.keys(resourcesByType);
    const combinations = getCombinations(resourcesByType, resourceTypes);
    resourceDateCombinations[date] = combinations;
  });

  function getCombinations(resourcesByType, resourceTypes) {
    const combinations = [];
    const maxIndex = resourceTypes.length - 1;
    const indexes = resourceTypes.map(() => 0);

    while (true) {
      const combination = resourceTypes.map((type, i) => resourcesByType[type][indexes[i]]);
      combinations.push(combination);

      let j = maxIndex;
      while (j >= 0 && indexes[j] === resourcesByType[resourceTypes[j]].length - 1) {
        indexes[j] = 0;
        j--;
      }

      if (j < 0) {
        break;
      }

      indexes[j]++;
    }

    return combinations;
  }

  let finalArray = [];
  for (const date in resourceDateCombinations) {
    const innerArray = resourceDateCombinations[date];
    for (const array of innerArray) {

      let combinedObject = {};
      combinedObject.date = date;
      combinedObject.type = appointmentType;

      for (const slot of array) {

        if (slot.type === "Researcher") {
          combinedObject.researcherName = slot.name;
          combinedObject.researcherId = slot.id;
          combinedObject.researcherStartTime = slot.start_time;
          combinedObject.researcherEndTime = slot.end_time;
        } else if (slot.type === "Psychologist") {
          combinedObject.psychologistName = slot.name;
          combinedObject.psychologistId = slot.id;
          combinedObject.psychologistStartTime = slot.start_time;
          combinedObject.psychologistEndTime = slot.end_time;
        } else if (slot.type === "Room") {
          combinedObject.roomName = slot.name;
          combinedObject.roomId = slot.id;
          combinedObject.roomStartTime = slot.start_time;
          combinedObject.roomEndTime = slot.end_time;
        } else if (slot.type === "Nurse") {
          combinedObject.nurseName = slot.name;
          combinedObject.nurseId = slot.id;
          combinedObject.nurseStartTime = slot.start_time;
          combinedObject.nurseEndTime = slot.end_time;
        }

      }

      let combinedSlotsWithMinimumResourcesRequired = checkRequiredResourcesAvailableForAppointmentType(combinedObject);

      if (combinedSlotsWithMinimumResourcesRequired) {
        let possibleSlotAppointmentTimes = calculatePossibleSlotAppointmentTimes(combinedSlotsWithMinimumResourcesRequired);
        finalArray.push(
          ...possibleSlotAppointmentTimes.map(slot => ({
            ...slot,
            researcherName: combinedSlotsWithMinimumResourcesRequired.researcherName,
            psychologistName: combinedSlotsWithMinimumResourcesRequired.psychologistName,
            roomName: combinedSlotsWithMinimumResourcesRequired.roomName,
            nurseName: combinedSlotsWithMinimumResourcesRequired.nurseName,
            appointmentNumber: appointmentNumber

          }))

        )
      }


    }
  }
  return finalArray;
}

function calculatePossibleSlotAppointmentTimes(combinedSlotsWithMinimumResourcesRequired) {

  // Extract the required data from the combinedSlotsWithMinimumResourcesRequired object
  const {
    date,
    type,
    roomStartTime,
    roomEndTime,
    psychologistStartTime,
    psychologistEndTime,
    researcherStartTime,
    researcherEndTime,
    nurseStartTime,
    nurseEndTime
  } = combinedSlotsWithMinimumResourcesRequired;

  const {
    researcherOffset,
    researcherDuration,
    nurseOffset,
    nurseDuration,
    psychologistOffset,
    psychologistDuration,
    roomOffset,
    roomDuration
  } = appointmentRules[type];

  const participantDuration = Math.max(researcherDuration + researcherOffset, nurseDuration + nurseOffset, psychologistDuration + psychologistOffset, roomDuration + roomOffset);

  let earliestStartTime;
  let latestStartTime;

  if (researcherDuration && nurseDuration && psychologistDuration && roomDuration) {

    earliestStartTime = moment.max(
      moment(researcherStartTime).subtract(researcherOffset, 'minutes'),
      moment(nurseStartTime).subtract(nurseOffset, 'minutes'),
      moment(psychologistStartTime).subtract(psychologistOffset, 'minutes'),
      moment(roomStartTime).subtract(roomOffset, 'minutes')
    );

    const nurseEndWithOffset = moment(nurseEndTime).subtract(nurseOffset, 'minutes');
    const researcherEndWithOffset = moment(researcherEndTime).subtract(researcherOffset, 'minutes');
    const psychologistEndWithOffset = moment(psychologistEndTime).subtract(psychologistOffset, 'minutes');
    const roomEndWithOffset = moment(roomEndTime).subtract(roomOffset, 'minutes');

    latestStartTime = moment.min(
      moment(researcherEndWithOffset).subtract(researcherDuration, 'minutes'),
      moment(nurseEndWithOffset).subtract(nurseDuration, 'minutes'),
      moment(psychologistEndWithOffset).subtract(psychologistDuration, 'minutes'),
      moment(roomEndWithOffset).subtract(roomDuration, 'minutes')
    );

  } else if (researcherDuration && roomDuration && psychologistDuration && nurseDuration === 0) {

    earliestStartTime = moment.max(
      moment(researcherStartTime).subtract(researcherOffset, 'minutes'),
      moment(roomStartTime).subtract(nurseOffset, 'minutes'),
      moment(psychologistStartTime).subtract(psychologistOffset, 'minutes')
    );

    const roomEndWithOffset = moment(roomEndTime).subtract(roomOffset, 'minutes');
    const researcherEndWithOffset = moment(researcherEndTime).subtract(researcherOffset, 'minutes');
    const psychologistEndWithOffset = moment(psychologistEndTime).subtract(psychologistOffset, 'minutes');

    latestStartTime = moment.min(
      moment(researcherEndWithOffset).subtract(researcherDuration, 'minutes'),
      moment(roomEndWithOffset).subtract(nurseDuration, 'minutes'),
      moment(psychologistEndWithOffset).subtract(psychologistDuration, 'minutes')
    );

  } else if (researcherDuration && nurseDuration && psychologistDuration === 0 && roomDuration === 0) {

    earliestStartTime = moment.max(
      moment(researcherStartTime).subtract(researcherOffset, 'minutes'),
      moment(nurseStartTime).subtract(nurseOffset, 'minutes')
    );

    const nurseEndWithOffset = moment(nurseEndTime).subtract(nurseOffset, 'minutes');
    const researcherEndWithOffset = moment(researcherEndTime).subtract(researcherOffset, 'minutes');

    latestStartTime = moment.min(
      moment(researcherEndWithOffset).subtract(researcherDuration, 'minutes'),
      moment(nurseEndWithOffset).subtract(nurseDuration, 'minutes')
    );

  }

  const timeIncrement = 15; // Time increment in minutes
  const appointmentSlots = [];
  let currentTime = moment(earliestStartTime);

  while (currentTime.isSameOrBefore(latestStartTime)) {
    const startTime = moment(currentTime);
    const endTime = moment(currentTime).add(participantDuration, 'minutes');

    appointmentSlots.push({
      startTime: startTime.format('YYYY-MM-DD HH:mm'),
      endTime: endTime.format('YYYY-MM-DD HH:mm')
    });

    currentTime.add(timeIncrement, 'minutes');
  }

  return appointmentSlots;

}


function checkRequiredResourcesAvailableForAppointmentType(combinedObject) {
  if (combinedObject.type === "type1") {
    if (combinedObject.researcherName && combinedObject.nurseName) {
      return combinedObject;
    } else {
      return null;
    }
  } else if (combinedObject.type === "type2") {
    if (combinedObject.researcherName && combinedObject.psychologistName && combinedObject.roomName && combinedObject.nurseName) {
      return combinedObject;
    } else {
      return null;
    }
  } else if (combinedObject.type === "type3") {
    if (combinedObject.researcherName && combinedObject.psychologistName && combinedObject.roomName) {
      return combinedObject;
    } else {
      return null;
    }
  }
}

module.exports = { populateAvailableSlots, formatTimeSlotsWithAppointmentNumberLogic }