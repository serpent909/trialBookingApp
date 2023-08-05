function appointmentNumberToType(appointmentNumber) {
    appointmentNumber = parseInt(appointmentNumber);
  if (appointmentNumber == 1 || appointmentNumber == 2) {
    return appointmentNumber;
  } else {
    return 3;
  }
}

