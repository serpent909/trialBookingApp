CREATE TABLE appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER,
        appointment_number INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        CONSTRAINT unique_participant_appointment UNIQUE (participant_id, appointment_number)
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
SELECT 'Researcher', 'Researcher1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'Researcher1');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Researcher', 'Researcher2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'Researcher2');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Nurse', 'Nurse'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'Room1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'Room1');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'Room2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'Room2');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'Room3'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'Room3');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist1');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist2');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist3'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist3');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist4'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist4');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist5'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist5');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist6'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist6');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'Psychologist7'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Psychologist7');


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