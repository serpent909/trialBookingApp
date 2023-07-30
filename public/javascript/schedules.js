document.addEventListener("DOMContentLoaded", function () {

    const deleteSelectedButton = document.getElementById("deleteSelectedButton");

    deleteSelectedButton.disabled = true;

    const form = document.getElementById("scheduleFilterForm");

    // Retrieve the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Set the form values from the query parameters
    const startDateInput = document.getElementById("startDate");
    startDateInput.value = urlParams.get("startDate") || "";

    const endDateInput = document.getElementById("endDate");
    endDateInput.value = urlParams.get("endDate") || "";

    const resourceNameInput = document.getElementById("resourceName");
    resourceNameInput.value = urlParams.get("resourceName") || "";


    form.addEventListener("submit", function (event) {
  
        event.preventDefault();
        const formData = new FormData(form);
        const searchParams = new URLSearchParams();
        for (const pair of formData) {
            searchParams.append(pair[0], pair[1]);
        }
        window.location.href = "/schedules?" + searchParams.toString();
    });

    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const rowCheckboxes = document.getElementsByClassName("row-checkbox");
    const selectedRowIds = new Set();




    selectAllCheckbox.addEventListener("change", function () {
        const isChecked = selectAllCheckbox.checked;

        // Update the state of all row checkboxes based on the select all checkbox
        for (let i = 0; i < rowCheckboxes.length; i++) {
            console.log("hihihihih")
            rowCheckboxes[i].checked = isChecked;
            const rowId = rowCheckboxes[i].closest("tr").getAttribute("data-id");

            if (isChecked) {
                selectedRowIds.add(rowId);
            } else {
                selectedRowIds.delete(rowId);
            }

            deleteSelectedButton.disabled = selectedRowIds.size === 0;
            deleteSelectedButton.classList.toggle("button-disabled", selectedRowIds.size === 0);
        }
    });

    // Event listener for row checkboxes
    for (let i = 0; i < rowCheckboxes.length; i++) {

        rowCheckboxes[i].addEventListener("change", function () {
            const isChecked = rowCheckboxes[i].checked;
            const rowId = rowCheckboxes[i].closest("tr").getAttribute("data-id");

            if (isChecked) {
                selectedRowIds.add(rowId);
            } else {
                selectedRowIds.delete(rowId);
            }

            // Update the state of the select all checkbox
            selectAllCheckbox.checked = selectedRowIds.size === rowCheckboxes.length;
            deleteSelectedButton.disabled = selectedRowIds.size === 0;
            deleteSelectedButton.classList.toggle("button-disabled", selectedRowIds.size === 0);
        });
    }

    deleteSelectedButton.addEventListener("click", async function () {
        const selectedRowIdsArray = Array.from(selectedRowIds);

        const url = '/schedules';

        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedRowIdsArray),
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
            window.location.reload();
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



    //   const response = await fetch("/schedules", {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(selectedRowIdsArray),
    //   });

    //   const jsonResponse = await response.json();
    //     console.log(jsonResponse);
    // } catch (error) {
    //   console.error(error);
    // console.log("there was an issue")
    // }
    // await Promise.all(
    //     window.location.reload()
    // );


});