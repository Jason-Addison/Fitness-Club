INSERT INTO Equipment (name, last_maintained_date, maintenance_frequency, maintenance_task_description)
VALUES
  ('Treadmill', '2023-12-01', 3, 'Clean and lubricate the belt'),
  ('Elliptical Machine', '2023-12-15', 2, 'Check and tighten bolts and screws'),
  ('Dumbbells', '2023-11-20', 4, 'Inspect for wear and tear');

INSERT INTO Rooms (room_name) VALUES
('Big Room'),
('Small Room'),
('Main Room');

INSERT INTO GroupSessions (session_name, room_id, start_time, end_time) VALUES
('Yoga Class', 1, '2022-04-01 09:00:00', '2025-04-01 10:00:00'),
('Zumba Fitness', 2, '2025-04-02 10:00:00', '2025-04-02 11:00:00'),
('Pilates Session', 3, '2025-04-03 11:00:00', '2025-04-03 12:00:00');

INSERT INTO Members (name, height) VALUES ('John Doe', 183);
INSERT INTO Members (name, height) VALUES ('Jane Doe', 167);
INSERT INTO Datapoints (member_id, goal_id, value) VALUES
(1, 0, 150),
(1, 0, 170),
(1, 0, 190),
(1, 1, 150),
(1, 2, 200),
(1, 3, 4);

INSERT INTO Datapoints (member_id, goal_id, value) VALUES
(2, 0, 150),
(2, 0, 140),
(2, 0, 130),
(2, 4, 160),
(2, 5, 220),
(2, 5, 240),
(2, 6, 5);

INSERT INTO Trainers (name) VALUES
    ('Billy Bob'),
    ('Trainer Dude');

INSERT INTO Availability (trainer_id, start_date, end_date) VALUES
    (1, '2024-04-01 09:00:00', '2024-09-01 12:00:00'),
    (1, '2025-04-02 09:00:00', '2025-04-02 12:00:00');

INSERT INTO Availability (trainer_id, start_date, end_date) VALUES
    (2, '2025-04-01 13:00:00', '2025-04-01 16:00:00'),
    (2, '2025-04-02 13:00:00', '2099-04-02 16:00:00');

INSERT INTO PersonalSessions (member_id, trainer_id, start_date, end_date)
VALUES (1, 1, '2024-06-01 10:00:00', '2024-06-01 11:00:00');

INSERT INTO GroupBooking (session_id, member_id) VALUES (1, 1);

