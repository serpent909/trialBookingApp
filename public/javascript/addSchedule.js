document.addEventListener('DOMContentLoaded', function () {

    const addSchedulesButton = document.getElementById('addSchedulesButton');

    function openModal() {
        document.getElementById('addSchedulesModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('addSchedulesModal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }

    document.getElementById('overlay').addEventListener('click', closeModal);

    addSchedulesButton.addEventListener('click', function () {
        openModal();
    });

    document.getElementById('scheduleForm').addEventListener('submit', function (event) {

        event.preventDefault();

        const startTime = document.getElementById('schStartTime').value;
        const endTime = document.getElementById('schEndTime').value;
        const startDate = document.getElementById('schStartDate').value;
        const endDate = document.getElementById('schEndDate').value;
        const day = document.getElementById('schDay').value;
        const resourceName = document.getElementById('schResourceName').value;


        const schedule = {

            startTime: startTime,
            endTime: endTime,
            startDate: startDate,
            endDate: endDate,
            day: day,
            resourceName: resourceName
        };


        fetch('/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schedule)
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error);
                });
            }
        }).then(data => {
            console.log('Success:', data);

            Toastify({
                text: data.message,
                duration: 3000,
                gravity: "top",
                position: 'center',
                backgroundColor: "#4caf50",
                newWindow: true
            }).showToast();

            closeModal();

            // Reload the window after showing the toast (you can adjust the delay if needed)
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Wait for 3 seconds before reloading
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

});