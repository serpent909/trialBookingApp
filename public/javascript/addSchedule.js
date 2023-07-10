document.addEventListener('DOMContentLoaded', function () {

    const addSchedulesButton = document.getElementById('addSchedulesButton');
    const addSchedulesModal = document.getElementById('addSchedulesModal');


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

});