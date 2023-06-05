CREATE TABLE IF NOT EXISTS
    appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER,
        appointment_number INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
    );

-- Create the 'bookable_things' table
CREATE TABLE
    IF NOT EXISTS bookable_things (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT NOT NULL
    );

-- Populate 'bookable_things' with predefined types if they don't exist
INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Researcher', 'researcher1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'researcher1');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Researcher', 'researcher2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'researcher2');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Nurse', 'nurse'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'room1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'room1');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'room2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'room2');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'room3'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'room3');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist1');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist2');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist3'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist3');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist4'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist4');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist5'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist5');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist6'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist6');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist7'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist7');


-- Create the 'booked_times' table
CREATE TABLE IF NOT EXISTS booked_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    bookable_thing_id INTEGER,
    booked_name TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);

-- Create the 'schedules' table
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookable_thing_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);