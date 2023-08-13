document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('appointmentTypeForm');

    // Retrieve the query string parameters
    const searchParams = new URLSearchParams(window.location.search);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const researcherName = searchParams.get('researcherName');
    const psychologistName = searchParams.get('psychologistName');
    const roomName = searchParams.get('roomName');
    const nurseName = searchParams.get('nurseName');
    const appointmentNumber = searchParams.get('appointmentNumber');
    const participantNumber = searchParams.get('participantNumber');
  

    // Update the form fields with the search parameter values
    document.getElementById('startDate').value = startDate || '';
    document.getElementById('endDate').value = endDate || '';
    document.getElementById('participantNumber').value = participantNumber || '';
    document.getElementById('appointmentNumber').value = appointmentNumber || '';
    document.getElementById('psychologistName').value = psychologistName || '';
    document.getElementById('researcherName').value = researcherName || '';
    document.getElementById('roomName').value = roomName || '';
    document.getElementById('nurseName').value = nurseName || '';

    form.addEventListener('submit', function (event) {
      // Store the form values in localStorage
      const formValues = {
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        appointmentNumber: document.getElementById('appointmentNumber').value,
        participantNumber: document.getElementById('participantNumber').value,
        psychologistName: document.getElementById('psychologistName').value,
        roomName: document.getElementById('roomName').value,
        researcherName: document.getElementById('researcherName').value,
        nurseName: document.getElementById('nurseName').value,
      };

      localStorage.setItem('formValues', JSON.stringify(formValues));
    });

    function populateCard(formValues) {
      let cards = document.querySelectorAll('.participant-number');
      cards.forEach(function (card) {
        card.innerHTML = formValues.participantNumber;
      });
    }

    // Populate the card with the search parameter values
    populateCard({ participantNumber: participantNumber || '', });
  });