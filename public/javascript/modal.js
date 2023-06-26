document.addEventListener('DOMContentLoaded', function () {
  const bookButtons = document.querySelectorAll('.book-button');
  const bookingModal = document.getElementById('bookingModal');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');
  const closeBtn1 = bookingModal.querySelector('.close');
  const closeBtn2 = document.getElementById('closeButton');

  let selectedAppointment = null;

  // Add event listener to each book button
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

      selectedAppointment = {
        startTime: startTime,
        endTime: endTime,
        researcherName: researcherName,
        psychologistName: psychologistName,
        roomName: roomName,
        nurseName: nurseName
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
  }

  // Show the booking modal
  function showModal() {
    bookingModal.classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(function() {
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
    // Add your logic here to handle the confirmed booking
    // Close the modal
    closeBookingModal();
    

    const url = '/appointments2'; // replace with your endpoint url

    fetch(url, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedAppointment), 
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });

  // Close button click event
  closeBtn1.addEventListener('click', function () {
    closeBookingModal();
  });

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