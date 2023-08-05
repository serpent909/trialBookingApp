
const moment = require('moment');

async function addSchedules(db, startTime, endTime, startDate, endDate, day, resourceName) {

    const dates = getDayDates(startDate, endDate, day);
    const resourceId = await getResourceId(db, resourceName);
    const existingAppointments = await checkForExistingAppointments(db, dates, resourceId);

    if (existingAppointments && existingAppointments.length > 0) {

        const datesArray = existingAppointments.map((appointment) => {
            return moment(appointment.start_time).format('YYYY-MM-DD');
        });

        const datesString = datesArray.join(', ');

        throw new Error(`There are already appointments booked for ${datesString}`);
    }

    const existingSchedules = await checkForExistingSchedules(db, dates, resourceId);

    if (existingSchedules && existingSchedules.length > 0) {

        const datesArray = existingSchedules.map((schedule) => {
            return moment(schedule.start_time).format('YYYY-MM-DD');
        });

        const datesString = datesArray.join(', ');

        throw new Error(`There are already schedules booked for ${datesString}`);
    }

    for (const date of dates) {
        const fullStart = date + ' ' + startTime;
        const fullEnd = date + ' ' + endTime;
        await db.run(
            "INSERT INTO schedules (bookable_thing_id, start_time, end_time) VALUES (?, ?, ?)",
            [resourceId, fullStart, fullEnd]
        );
    }
}


const getResourceId = async (db, resourceName) => {

    let resourceId = null;
    const resourceRows = await db.get(`SELECT id FROM bookable_things WHERE name = ?`, [resourceName]);

    if (!resourceRows) {
        throw new Error(`Resource ${resourceName} does not exist`);
    } else {
        resourceId = resourceRows.id;
    }

    return resourceId;
}


const checkForExistingAppointments = async (db, dates, resourceId) => {
 
    let existingAppointments = [];

    for (const date of dates) {
        const dateRow = await db.get(`SELECT * FROM booked_times WHERE strftime('%Y-%m-%d', start_time) = ? AND bookable_thing_id = ?`, [date, parseInt(resourceId)]);
        if (dateRow) {
            existingAppointments.push(dateRow);
        }
    };

    return existingAppointments;
}


const checkForExistingSchedules = async (db, dates, resourceId) => {

    let existingSchedules = [];

    for (const date of dates) {
        const dateRow = await db.get(`SELECT * FROM schedules WHERE date(start_time) = ? AND bookable_thing_id = ?`, [date, resourceId]);
        if (dateRow) {
            existingSchedules.push(dateRow);
        }
    };

    return existingSchedules;
}

const getDayDates = (startDate, endDate, day) => {
    const result = [];
    const start = moment(startDate);
    const end = moment(endDate);

    while (start <= end) {
        if (start.format('dddd') === day) {
            result.push(start.format('YYYY-MM-DD'));
        }
        start.add(1, 'day');
    }
    return result;
};


module.exports = {
    addSchedules
}