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
                closeModal();
                window.location.reload();
            } else {
                
                return response.json().then(data => {
                    alert(data.error);
                });
            }
        });
    
    });

});