const moment = require('moment');

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
  
  
  function populateAvailableSlots(baseAvailabilitySchedules, bookedTimes, startDate, endDate, researcherTime, nurseTime, psychologistTime, roomTime, psychologistName, roomName) {
  
    const availableSlots = [];
  
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
  
    return availableSlots;
  
  }

  module.exports = {populateAvailableSlots}