DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS bookable_things;
DROP TABLE IF EXISTS booked_times;
DROP TABLE IF EXISTS schedules;

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
        FOREIGN KEY (participant_id) REFERENCES bookable_things (id),
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
        type TEXT NOT NULL
    );

-- Populate 'bookable_things' with predefined types if they don't exist
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Participant'    WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Participant');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Researcher'     WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Nurse'          WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse');

-- Insert 8 rows with the 'Psychologist' type
INSERT OR IGNORE INTO bookable_things (type)
SELECT 'Psychologist'
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) seq
WHERE NOT EXISTS (
    SELECT 1
    FROM bookable_things
    WHERE type = 'Psychologist'
);

-- Insert 2 rows with the 'Room' type
INSERT OR IGNORE INTO bookable_things (type)
SELECT 'Room'
FROM (SELECT 1 UNION SELECT 2) seq
WHERE NOT EXISTS (
    SELECT 1
    FROM bookable_things
    WHERE type = 'Room'
);

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

CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    bookable_thing_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);