CREATE TABLE IF NOT EXISTS
    appointments (
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
SELECT 'Researcher', 'Alesha'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'Alesha');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Researcher', 'Lucia'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher' AND name = 'Lucia');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Nurse', 'Sarah'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse' AND name = 'Sarah');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Nurse',  'Nurse1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse' AND name = 'Nurse2');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'Room1'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'Room1');

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Room', 'Room2'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room' AND name = 'Room2');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist', 'Anoosh'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Anoosh');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist',  'Geraldine' 
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Geraldine');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist',  "Ka'ula"
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = "Ka'ula");

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist',  'Eva'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Eva');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist', 'Amy'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Amy');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist',  'Meihana'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Meihana');

INSERT OR IGNORE INTO bookable_things (type, name) 
SELECT 'Psychologist', 'Sonali'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'Sonali');


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