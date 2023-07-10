document.addEventListener('DOMContentLoaded', function () {



  const bookButtons = document.querySelectorAll('.book-button');
  const bookingModal = document.getElementById('bookingModal');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');
  const closeBtn1 = bookingModal.querySelector('.close');
  const closeBtn2 = document.getElementById('closeButton');

  let selectedAppointment = null;


  // Add event listener to each book button
  bookButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const card = button.closest('.card');

      const startTime = card.querySelector('#start-time').textContent;
      const endTime = card.querySelector('#end-time').textContent;
      const researcherName = card.querySelector('#researcher-name').textContent;
      const psychologistName = card.querySelector('#psychologist-name').textContent;
      const roomName = card.querySelector('#room-name').textContent;
      const nurseName = card.querySelector('#nurse-name').textContent;
      const appointmentNumber = card.querySelector('.appointment-number').textContent;
      const participantNumber = card.querySelector('.participant-number').textContent;
      const date = card.querySelector('#date').textContent;

      selectedAppointment = {
        startTime: startTime,
        endTime: endTime,
        date: date,
        researcherName: researcherName,
        psychologistName: psychologistName,
        roomName: roomName,
        nurseName: nurseName,
        participantNumber: participantNumber,
        appointmentNumber: appointmentNumber
      };

      populateModalContent();
      showModal();
    });
  });

  // Populate the content of the modal with the selected appointment details
  function populateModalContent() {

    document.getElementById('startTimeModal').textContent = selectedAppointment.startTime;
    document.getElementById('endTimeModal').textContent = selectedAppointment.endTime;
    document.getElementById('researcherNameModal').textContent = selectedAppointment.researcherName;
    document.getElementById('psychologistNameModal').textContent = selectedAppointment.psychologistName;
    document.getElementById('roomNameModal').textContent = selectedAppointment.roomName;
    document.getElementById('nurseNameModal').textContent = selectedAppointment.nurseName;
    document.getElementById('participantNumberModal').textContent = selectedAppointment.participantNumber;
    document.getElementById('appointmentNumberModal').textContent = selectedAppointment.appointmentNumber;
    document.getElementById('dateModal').textContent = selectedAppointment.date;


  }

  // Show the booking modal
  function showModal() {
    bookingModal.classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(function () {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  // Close the booking modal
  function closeBookingModal() {
    bookingModal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  // Confirm booking button click event
  confirmBookingBtn.addEventListener('click', function () {
    const multiple_appointments = document.getElementById('multiple_appointments').value;
    selectedAppointment.multiple_appointments = multiple_appointments;
  
    const url = '/appointments';
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedAppointment),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            throw new Error(data.error);
          });
        }
      }).then(data => {
        console.log('Success:', data);
        closeBookingModal();
  
        Toastify({
          text: data.message,
          duration: 3000,
          gravity: "top",
          position: 'center',
          backgroundColor: "#4caf50",
          newWindow: true
        }).showToast();
      }).catch(error => {
        console.error('Error:', error);
  
        Toastify({
          text: error.message,
          duration: -1,
          gravity: "top",
          position: 'center',
          backgroundColor: "#ff0000",
          close: true
        }).showToast();
      });
  });

  // Close button click event


  closeBtn2.addEventListener('click', function () {
    closeBookingModal();
  });

  function handleOutsideClick(event) {
    if (event.target === bookingModal) {
      closeBookingModal();
      document.removeEventListener('click', handleOutsideClick);
    }
  }

});