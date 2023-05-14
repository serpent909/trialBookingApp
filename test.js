

function calculateAvailableBlocks(blockStart, blockEnd, appointmentStart, appointmentEnd) {
    const availableBlocks = [];
  
    if (appointmentEnd < blockStart || appointmentStart > blockEnd) {
      // Appointment does not overlap with time block, the entire block is available
      availableBlocks.push({ start: blockStart, end: blockEnd });
    } else {
      if (appointmentStart > blockStart) {
        // Add available block before the appointment start time
        availableBlocks.push({ start: blockStart, end: appointmentStart });
      }
  
      if (appointmentEnd < blockEnd) {
        // Add available block after the appointment end time
        availableBlocks.push({ start: appointmentEnd, end: blockEnd });
      }
  
      if (appointmentStart <= blockStart && appointmentEnd >= blockEnd) {
        // Appointment completely covers the time block, split into three available blocks
        const beforeAppointment = { start: blockStart, end: appointmentStart };
        const duringAppointment = { start: appointmentStart, end: appointmentEnd };
        const afterAppointment = { start: appointmentEnd, end: blockEnd };
        availableBlocks.push(beforeAppointment, duringAppointment, afterAppointment);
      }
    }
  
    return availableBlocks;
  }
  
  // Example usage
  let blockStart = new Date('2023-05-01T08:00:00.000Z');
  let blockEnd = new Date('2023-05-01T16:00:00.000Z');
  let appointmentStart = new Date('2023-05-01T09:00:00.000Z');
  let appointmentEnd = new Date('2023-05-01T10:00:00.000Z');
  
  const availableBlocks = calculateAvailableBlocks(blockStart, blockEnd, appointmentStart, appointmentEnd);
  console.log(availableBlocks);