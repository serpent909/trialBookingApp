const moment = require('moment');
const appointmentService = require('./appointmentService.js');

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

  module.exports = { populateAvailableSlots }