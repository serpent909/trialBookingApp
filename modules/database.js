const fs = require('fs');
const path = require('path');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = path.join(__dirname, '..', 'project-database.db');
const SQL_SCRIPT_PATH = path.join(__dirname, '..', 'sql', 'project-database-init-script.sql');
const AVAILABILITY_DIR = path.join(__dirname, '..', 'config');

const sqlScript = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

function readAvailabilityJson(resource) {
  const filePath = path.join(AVAILABILITY_DIR, `${resource}.json`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

function generateScheduleEntries(availabilityJson, resourceId, resourceName, resourceType) {

  const availability = availabilityJson.availability;
  const scheduleEntries = [];

  availability.forEach((availabilityPeriod) => {
    const startDate = new Date(availabilityPeriod.startDate);
    const endDate = new Date(availabilityPeriod.endDate);

    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const currentDayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' });

      const availabilityByDay = availabilityPeriod.availabilityByDay.find((item) => item.dayOfWeek === currentDayOfWeek);

      if (availabilityByDay) {
        const startTime = availabilityByDay.startTime;
        const endTime = availabilityByDay.endTime;
        const startDateTime = new Date(currentDate);
        const endDateTime = new Date(currentDate);

        startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
        endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);

        scheduleEntries.push({
          bookable_thing_id: resourceId,
          name: resourceName,
          type: resourceType,
          start_time: toLocalISOString(startDateTime),
          end_time: toLocalISOString(endDateTime),
        });
      }
    }
  });

  return scheduleEntries;
}

function toLocalISOString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

async function getResourceId(db, resourceName) {
  const row = await db.get('SELECT id FROM bookable_things WHERE name = ?', [resourceName]);
  return row ? row.id : null;
}

async function getResourceName(db, resourceName) {
  const row = await db.get('SELECT name FROM bookable_things WHERE name = ?', [resourceName]);
  return row ? row.name : null;
}

async function getResourcType(db, resourceType) {
  const row = await db.get('SELECT type FROM bookable_things WHERE type = ?', [resourceType]);
  return row ? row.type : null;
}

async function populateSchedules(db) {
  const resources = [
    { name: 'Researcher1', type: 'Researcher' },
    { name: 'Researcher2', type: 'Researcher' },
    { name: 'Nurse', type: 'Nurse' },
    { name: 'Room1', type: 'Room' },
    { name: 'Room2', type: 'Room' },
    { name: 'Room3', type: 'Room' },
    { name: 'Psychologist1', type: 'Psychologist' },
    { name: 'Psychologist2', type: 'Psychologist' },
    { name: 'Psychologist3', type: 'Psychologist' },
    { name: 'Psychologist4', type: 'Psychologist' },
    { name: 'Psychologist5', type: 'Psychologist' },
    { name: 'Psychologist6', type: 'Psychologist' },
    { name: 'Psychologist7', type: 'Psychologist' }
  ];

  for (const resource of resources) {

    const availabilityJson = readAvailabilityJson(resource.name.toLowerCase());
    const resourceId = await getResourceId(db, resource.name);
    const resourceName = await getResourceName(db, resource.name);
    const resourceType = await getResourcType(db, resource.type);

    const scheduleEntries = generateScheduleEntries(availabilityJson, resourceId, resourceName, resourceType);

    // Clear availability table for the current resource
    await db.run('DELETE FROM schedules WHERE bookable_thing_id = ?', [resourceId]);


    for (const entry of scheduleEntries) {

      await db.run(
        'INSERT INTO schedules (bookable_thing_id, start_time, end_time) VALUES (?,?, ?)',
        [entry.bookable_thing_id, entry.start_time, entry.end_time]
      );
    }
  }
}

async function initDatabase() {
  try {
    const db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON');
    await db.exec(sqlScript);
    console.log('SQL script executed successfully');

    const resourceScheduleData = await db.all('SELECT * FROM schedules');

    if (Object.keys(resourceScheduleData).length === 0) {
      await populateSchedules(db);

    }

    return db;
  } catch (err) {
    console.error('Failed to execute the SQL script:', err);
    throw err;
  }
}

module.exports = initDatabase();