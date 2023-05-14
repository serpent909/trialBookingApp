CREATE TABLE IF NOT EXISTS
    appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER NOT NULL,
        researcher_id INTEGER,
        nurse_id INTEGER,
        psychologist_id INTEGER,
        room_id INTEGER,
        appointment_type_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        FOREIGN KEY (researcher_id) REFERENCES bookable_things (id),
        FOREIGN KEY (nurse_id) REFERENCES bookable_things (id),
        FOREIGN KEY (psychologist_id) REFERENCES bookable_things (id),
        FOREIGN KEY (room_id) REFERENCES bookable_things (id),
        UNIQUE (participant_id, appointment_type_id)
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
SELECT 'Researcher', 'researcher'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher');

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

INSERT OR IGNORE INTO bookable_things (type, name)
SELECT 'Psychologist', 'psychologist8'
WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist' AND name = 'psychologist8');


-- Create the 'booked_times' table
CREATE TABLE IF NOT EXISTS booked_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    bookable_thing_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);

-- Create the 'schedules' table
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookable_thing_id INTEGER,
    name TEXT,
    type TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);