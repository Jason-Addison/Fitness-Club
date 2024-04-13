CREATE TABLE Members
(
    member_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    height INTEGER NOT NULL
);

CREATE TABLE Equipment
(
    equipment_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_maintained_date DATE NOT NULL,
    maintenance_frequency INTEGER NOT NULL,
    maintenance_task_description TEXT
);


CREATE TABLE Rooms
(
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL
);

CREATE TABLE GroupSessions
(
    session_id SERIAL PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    room_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    CONSTRAINT valid_session_time CHECK (end_time > start_time)
);

CREATE TABLE Datapoints
(
    datapoint_id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES Members(member_id)
);

CREATE TABLE Trainers
(
    trainer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Availability
(
    availability_id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES Trainers(trainer_id)
);

CREATE TABLE PersonalSessions
(
    session_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (trainer_id) REFERENCES Trainers(trainer_id)
);

CREATE TABLE GroupBooking
(
    session_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES GroupSessions(session_id),
    FOREIGN KEY (member_id) REFERENCES Members(member_id)
);
