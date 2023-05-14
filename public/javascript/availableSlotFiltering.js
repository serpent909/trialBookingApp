// Listen for form submission
document.getElementById("appointmentTypeForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
  
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const appointmentType = document.getElementById("appointmentTypeSelect").value;
  
    // Build the URL with query parameters
    const url = `/appointmentAvailability?startDate=${startDate}&endDate=${endDate}&appointmentType=${appointmentType}`;
  
    // Send an AJAX request to the server
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        // Update the page content with the filtered availability
        document.getElementById("availableSlots").innerHTML = html;
      })
      .catch((error) => {
        console.error("Failed to retrieve appointment availability:", error);
      });
  });