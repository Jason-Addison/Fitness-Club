import express from 'express';
import pkg from 'pg';
import * as fs from "fs";
const {Pool} = pkg;
import cors from 'cors';

const app = express();
const PORT = 4000;
const MEMBERSHIP_MONTHLY = 100;
const PERSONAL_SESSION_PER_HOUR = 200;
const GROUP_SESSION_PER_HOUR = 50;

let pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.get('/api/trainers', async (req, res) =>
{
    try
    {
        const {rows} = await pool.query('SELECT * FROM trainers');
        res.json(rows);
    }
    catch (err)
    {
        console.error('Error fetching trainers:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/trainers/:trainerId/availabilities/:availabilityId', async (req, res) =>
{
    try
    {
        const trainerId = req.params.trainerId;
        const availabilityId = req.params.availabilityId;

        await pool.query('DELETE FROM Availability WHERE trainer_id = $1 AND availability_id = $2', [trainerId, availabilityId]);

        res.status(200).json({ message: 'Availability deleted successfully' });
    }
    catch (error)
    {
        console.error('Error deleting availability:', error);
        res.status(500).json({ message: 'Failed to delete availability' });
    }
});

app.delete('/api/unregister', async (req, res) =>
{
    const { sessionId, memberId } = req.body;
    try
    {
        const query = 'DELETE FROM GroupBooking WHERE session_id = $1 AND member_id = $2';
        await pool.query(query, [sessionId, memberId]);

        res.status(204).send();
    }
    catch (error)
    {
        console.error('Error deleting group booking:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/trainers/:trainerId/availabilities', async (req, res) =>
{
    const trainerId = parseInt(req.params.trainerId);
    try
    {
        const {rows} = await pool.query('SELECT * FROM Availability WHERE trainer_id = $1', [trainerId]);
        res.json(rows);
    }
    catch (err)
    {
        console.error('Error fetching availabilities:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/trainers/:trainerId/availabilities', async (req, res) =>
{
    const trainerId = parseInt(req.params.trainerId);
    const { startDate, endDate } = req.body;
    try
    {
        const conflictQuery = 'SELECT * FROM Availability WHERE trainer_id = $1 AND (($2 >= start_date AND $2 < end_date) OR ($3 > start_date AND $3 <= end_date) OR ($2 <= start_date AND $3 >= end_date))';
        const {rows} = await pool.query(conflictQuery, [trainerId, startDate, endDate]);

        if (rows.length > 0)
        {
            return res.status(409).json({ error: 'Conflicting availability exists' });
        }

        const insertQuery = 'INSERT INTO Availability (trainer_id, start_date, end_date) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(insertQuery, [trainerId, startDate, endDate]);
        const newAvailability = result.rows[0];

        res.status(201).json(newAvailability);
    }
    catch (err)
    {
        console.error('Error adding availability:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/rooms', async (req, res) =>
{
    try
    {
        const { rows } = await pool.query('SELECT * FROM rooms');
        res.json(rows);
    }
    catch (err)
    {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/group-sessions', async (req, res) =>
{
    try
    {
        const { rows } = await pool.query('SELECT * FROM groupsessions');
        res.json(rows);
    }
    catch (err)
    {
        console.error('Error fetching group sessions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const goals = [
    { id: 0, name: 'Weight (lb)' },
    { id: 1, name: 'Bench Press 1 Rep Max' },
    { id: 2, name: 'Squat 1 Rep Max' },
    { id: 3, name: 'Deadlift 1 Rep Max' },
    { id: 4, name: 'Body Fat Percentage' },
    { id: 5, name: 'Cardio Duration (minutes)' },
    { id: 6, name: 'Flexibility (inches)' },
    { id: 7, name: 'Muscle Mass (lb)' },
    { id: 8, name: 'Resting Heart Rate (bpm)' },
    { id: 9, name: 'Sleep Duration (hours)' }
];

app.get('/api/goals', (req, res) =>
{
    res.json(goals);
});

app.post('/api/datapoints', async (req, res) =>
{
    const { member_id, goal_id, value } = req.body;
    if (!member_id || !goal_id || !value)
    {
        return res.status(400).json({ error: 'Member ID, goal name, and value are required' });
    }

    try
    {
        const query = 'INSERT INTO datapoints (member_id, goal_id, value) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(query, [member_id, goal_id, value]);
        res.status(201).json(rows[0]);
    }
    catch (error)
    {
        console.error('Error adding goal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/datapoints', async (req, res) =>
{
    const { member_id } = req.query;
    if (!member_id)
    {
        return res.status(400).json({ error: 'Member ID is required' });
    }

    try
    {
        const query = 'SELECT * FROM datapoints WHERE member_id = $1 ORDER BY goal_id, created_at;';
        const { rows } = await pool.query(query, [member_id]);
        res.json(rows);
    }
    catch (error)
    {
        console.error('Error fetching goals by member ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/group-sessions', async (req, res) =>
{
    const { memberId } = req.query;
    try
    {
        const query = 'SELECT gs.* FROM GroupSessions gs JOIN GroupBooking gb ON gs.session_id = gb.session_id WHERE gb.member_id = $1';
        const {rows} = await pool.query(query, [memberId]);
        res.json(rows);
    }
    catch (error)
    {
        console.error('Error fetching signed-up classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/members/:memberId', async (req, res) =>
{
    const memberId = req.params.memberId;
    const { height } = req.body;
    try
    {
        const updateQuery = 'UPDATE Members SET height = $1 WHERE member_id = $2';
        await pool.query(updateQuery, [height, memberId]);

        res.sendStatus(200);
    }
    catch (error)
    {
        console.error('Error updating member height:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/group-sessions/signup', async (req, res) =>
{
    const { session_id, member_id } = req.body;
    try
    {
        const session = await pool.query('SELECT * FROM GroupSessions WHERE session_id = $1;', [session_id]);
        const start = session.rows[0].start_time;
        const end = session.rows[0].end_time;
        const conflictQuery = `
            SELECT gs.*
            FROM GroupSessions gs
            JOIN GroupBooking gb ON gs.session_id = gb.session_id
            WHERE gb.member_id = $1
            AND (
                (gs.start_time <= $3 AND gs.end_time >= $2) -- Partially overlapped
                OR
                (gs.start_time >= $2 AND gs.end_time <= $3) -- Entirely overlapped
            );
        `;

        const conflictResult = await pool.query(conflictQuery, [member_id, start, end]);
        if (conflictResult.rows.length > 0)
        {
            return res.status(409).json({ error: 'Conflict with existing group session booking' });
        }

        const groupSessionQuery = 'SELECT * FROM GroupSessions WHERE session_id = $1';
        const groupSessionResult = await pool.query(groupSessionQuery, [session_id]);
        if (groupSessionResult.rows.length === 0)
        {
            return res.status(404).json({ error: 'Group session not found' });
        }

        const signupQuery = 'INSERT INTO GroupBooking (session_id, member_id) VALUES ($1, $2)';
        await pool.query(signupQuery, [session_id, member_id]);

        res.status(201).json({ message: 'Signed up successfully' });
    }
    catch (error)
    {
        console.error('Error signing up for group session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/personal-sessions', async (req, res) =>
{
    const { member_id, trainer_id } = req.query;
    try
    {
        let query;
        let result;

        if (member_id)
        {
            query = 'SELECT * FROM PersonalSessions WHERE member_id = $1';
            result = await pool.query(query, [member_id]);
        }
        else if (trainer_id)
        {
            query = 'SELECT * FROM PersonalSessions WHERE trainer_id = $1';
            result = await pool.query(query, [trainer_id]);
        }
        else
        {
            res.json([]);
            return;
        }

        res.json(result.rows);
    }
    catch (error)
    {
        console.error('Error fetching personal sessions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/monthly-income-breakdown', async (req, res) =>
{
    try
    {
        const membersQuery = 'SELECT COUNT(*) AS member_count FROM Members';
        const membersResult = await pool.query(membersQuery);
        const memberCount = membersResult.rows[0].member_count;

        const personalSessionsQuery = 'SELECT SUM(EXTRACT(HOUR FROM end_date - start_date)) AS total_duration FROM PersonalSessions';
        const personalSessionsResult = await pool.query(personalSessionsQuery);
        const personalSessionHours = personalSessionsResult.rows[0].total_duration;

        const groupSessionsQuery = 'SELECT SUM(EXTRACT(HOUR FROM end_time - start_time)) AS total_duration FROM GroupSessions';
        const groupSessionsResult = await pool.query(groupSessionsQuery);
        const groupSessionHours = groupSessionsResult.rows[0].total_duration;

        const membershipIncome = memberCount * MEMBERSHIP_MONTHLY;
        const personalSessionIncome = personalSessionHours * PERSONAL_SESSION_PER_HOUR;
        const groupSessionIncome = groupSessionHours * GROUP_SESSION_PER_HOUR;

        const monthlyIncomeBreakdown = {
            membershipIncome,
            personalSessionIncome,
            groupSessionIncome,
            totalIncome: membershipIncome + personalSessionIncome + groupSessionIncome
        };
        res.json(monthlyIncomeBreakdown);
    }
    catch (error)
    {
        console.error('Error calculating monthly income breakdown:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/personal-sessions', async (req, res) =>
{
    const { trainer_id, start_date, end_date, member_id } = req.body;
    try
    {
        const personalSessionOverlapQuery = `
            SELECT * 
            FROM PersonalSessions 
            WHERE trainer_id = $1 
            AND (
                (start_date < $3 AND end_date > $2) 
                OR (start_date >= $2 AND start_date < $3) 
                OR (end_date > $2 AND end_date <= $3)
            )`;
        const personalSessionOverlapResult = await pool.query(personalSessionOverlapQuery, [trainer_id, start_date, end_date]);

        if (personalSessionOverlapResult.rows.length > 0)
        {
            return res.status(409).json({ error: 'New personal session overlaps with existing personal sessions for the trainer' });
        }

        const groupSessionOverlapQuery = `
            SELECT gs.* 
            FROM GroupSessions gs
            JOIN GroupBooking gb ON gs.session_id = gb.session_id
            WHERE gb.member_id = $1 
            AND (
                (gs.start_time < $3 AND gs.end_time > $2) 
                OR (gs.start_time >= $2 AND gs.start_time < $3) 
                OR (gs.end_time > $2 AND gs.end_time <= $3)
            )`;
        const groupSessionOverlapResult = await pool.query(groupSessionOverlapQuery, [member_id, start_date, end_date]);

        if (groupSessionOverlapResult.rows.length > 0)
        {
            return res.status(409).json({ error: 'New personal session overlaps with group sessions the member is signed up for' });
        }

        const trainerAvailabilityQuery = 'SELECT * FROM Availability WHERE trainer_id = $1 AND start_date <= $3 AND end_date >= $2';
        const availabilityResult = await pool.query(trainerAvailabilityQuery, [trainer_id, start_date, end_date]);

        if (availabilityResult.rows.length === 0)
        {
            return res.status(409).json({ error: 'New personal session must fall within one of the trainer\'s availabilities' });
        }

        const insertQuery = 'INSERT INTO PersonalSessions (trainer_id, start_date, end_date, member_id) VALUES ($1, $2, $3, $4)';
        await pool.query(insertQuery, [trainer_id, start_date, end_date, member_id]);

        res.status(201).json({ message: 'Personal session added successfully' });
    }
    catch (error)
    {
        console.error('Error adding personal session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/personal-sessions/:sessionId', async (req, res) =>
{
    const sessionId = req.params.sessionId;
    try
    {
        const query = 'DELETE FROM PersonalSessions WHERE session_id = $1';
        await pool.query(query, [sessionId]);

        res.status(200).json({ message: 'Personal session deleted successfully' });
    }
    catch (error)
    {
        console.error('Error deleting personal session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/group-sessions/:id', async (req, res) =>
{
    const sessionId = req.params.id;
    try
    {
        const deleteQuery = 'DELETE FROM groupsessions WHERE session_id = $1';
        await pool.query(deleteQuery, [sessionId]);
        res.status(204).send();
    }
    catch (error)
    {
        console.error('Error deleting group session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/add-class', async (req, res) =>
{
    try
    {
        const { className, startTime, endTime, room } = req.body;

        const queryText = `
          SELECT * 
          FROM groupsessions
          WHERE room_id = $1
          AND ((start_time <= $2 AND end_time >= $2)
          OR (start_time <= $3 AND end_time >= $3))
        `;
        const { rows } = await pool.query(queryText, [room, startTime, endTime]);

        if (rows.length > 0)
        {
            res.status(400).json({ message: 'Time conflict with existing class' });
        }
        else
        {
            const insertText = `
                INSERT INTO groupsessions (session_name, start_time, end_time, room_id)
                VALUES ($1, $2, $3, $4)
              `;
            await pool.query(insertText, [className, startTime, endTime, room]);

            res.status(200).json({ message: 'Class added successfully' });
        }
    }
    catch (error)
    {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/rooms', async (req, res) => {
    try
    {
        const queryText = 'SELECT * FROM rooms';
        const { rows } = await pool.query(queryText);
        console.log("ROWS: " + rows);
        res.json(rows);
    }
    catch (error)
    {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/members', async (req, res) => {
    try
    {
        const { search } = req.query;
        let query = 'SELECT * FROM members';
        if (search)
        {
            query += ` WHERE name ILIKE '%${search}%'`;
        }
        const result = await pool.query(query);
        res.send(JSON.stringify(result.rows));
    }
    catch (error)
    {
        console.error('Error fetching members', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/members', async (req, res) => {
    const { name, height } = req.body;
    try
    {
        const query = 'INSERT INTO members (name, height) VALUES ($1, $2) RETURNING *';
        const values = [name, height];
        const result = await pool.query(query, values);
        const newUser = result.rows[0];
        console.log("User added: " + name);
        res.status(201).json(newUser);
    }
    catch (error)
    {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/members/:memberId', async (req, res) =>
{
    const memberId = req.params.memberId;

    try
    {
        const result = await pool.query('SELECT * FROM members WHERE member_id = $1', [memberId]);
        const member = result.rows[0];

        if (!member)
        {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    }
    catch (error)
    {
        console.error('Error fetching member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/equipment', async (req, res) =>
{
    try
    {
        const client = await pool.connect();
        const {rows} = await pool.query('SELECT * FROM equipment ORDER BY equipment_id');
        res.json(rows);
        client.release();
    }
    catch (error)
    {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/equipment/:equipmentId/maintenance', async (req, res) =>
{
    const { equipmentId } = req.params;
    try
    {
        await pool.query('UPDATE equipment SET last_maintained_date = CURRENT_DATE WHERE equipment_id = $1', [equipmentId]);
        res.sendStatus(200);
    }
    catch (error)
    {
        console.error('Error resetting maintenance date:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const sqlSchema = fs.readFileSync('ddl.sql', 'utf8');
const demoData = fs.readFileSync('dml.sql', 'utf8');

const initializeDatabase = async () =>
{

    let clubClient;
    try
    {
        const client = await pool.connect();
        await client.query('DROP DATABASE IF EXISTS club');
        await client.query('CREATE DATABASE club');
        client.release();
        console.log('Database "club" dropped and recreated successfully');
        pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'club',
            password: 'postgres',
            port: 5432,
        });
        clubClient = await pool.connect();
        await clubClient.query(sqlSchema);
        await clubClient.query(demoData);
        console.log('Database schema initialized successfully');
    }
    catch (error)
    {
        console.error('Error initializing database:', error);
    }
    finally
    {
        clubClient.release();
    }
};

initializeDatabase();
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
