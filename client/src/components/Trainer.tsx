import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";

const Trainer = () => {
    const [trainers, setTrainers] = useState<any[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [personalSessions, setPersonalSessions] = useState<any[]>([]);

    useEffect(() =>
    {
        fetch('/api/trainers')
            .then(response => response.json())
            .then(data => setTrainers(data))
            .catch(error => console.error('Error fetching trainers:', error));
    }, []);

    const handleTrainerSelect = (trainerId: any) =>
    {
        setSelectedTrainer(trainerId);
        fetch(`/api/trainers/${trainerId}/availabilities`)
            .then(response => response.json())
            .then(data => setAvailabilities(data))
            .catch(error => console.error('Error fetching availabilities:', error));
        fetch(`/api/personal-sessions?trainer_id=${trainerId}`)
            .then(response => response.json())
            .then(data => setPersonalSessions(data))
            .catch(error => console.error('Error fetching personal sessions:', error));
    };

    const handleAddAvailability = () =>
    {
        const availabilityData =
        {
            startDate: newStart,
            endDate: newEnd
        };

        fetch(`/api/trainers/${selectedTrainer}/availabilities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(availabilityData),
        })
            .then(response =>
            {
                if (response.ok)
                {
                    return response.json();
                }
                else if (response.status === 409)
                {
                    alert("Time conflict!");
                }
                else
                {
                    throw new Error('Failed to add availability');
                }
                return;
            })
            .then(data =>
            {
                if(data)
                {
                    setAvailabilities([...availabilities, data]);
                }
            })
            .catch(error => console.error('Error adding availability:', error));
    };

    const handleDeleteAvailability = (availabilityId: any) =>
    {
        fetch(`/api/trainers/${selectedTrainer}/availabilities/${availabilityId}`, {
            method: 'DELETE',
        })
            .then(response =>
            {
                if (response.ok)
                {
                    setAvailabilities(availabilities.filter(avail => avail.availability_id !== availabilityId));
                }
                else
                {
                    throw new Error('Failed to delete availability.');
                }
            })
            .catch(error => console.error('Error deleting availability:', error));
    };

    const handleDeletePersonalSession = (sessionId: any) =>
    {
        fetch(`/api/personal-sessions/${sessionId}`, { method: 'DELETE' })
            .then(response =>
            {
                if (response.ok)
                {
                    setPersonalSessions(personalSessions.filter(session => session.session_id !== sessionId));
                }
                else
                {
                    console.error('Failed to delete personal session');
                }
            })
            .catch(error => console.error('Error deleting personal session:', error));
    };

    return (
        <div>
            <h2>Trainer Tab</h2>
            <div>
                <label>Select Trainer:</label>
                <select value={selectedTrainer} onChange={e => handleTrainerSelect(e.target.value)}>
                    <option value="">-- Select Trainer --</option>
                    {trainers.map(trainer => (
                        <option key={trainer.trainer_id} value={trainer.trainer_id}>{trainer.name}</option>
                    ))}
                </select>
            </div>
            {selectedTrainer && (
                <div>
                    <Link to="/membersearch">Go to Member Search</Link>
                    <h3>Availabilities</h3>
                    <ul>
                        {availabilities.map(availability => (
                            <li key={availability.availability_id}>
                                {availability.start_date} - {availability.end_date}
                                <button onClick={() => handleDeleteAvailability(availability.availability_id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <label>New Availability Start:</label>
                        <input type="datetime-local" value={newStart} onChange={e => setNewStart(e.target.value)} />
                    </div>
                    <div>
                        <label>New Availability End:</label>
                        <input type="datetime-local" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
                    </div>
                    <button onClick={handleAddAvailability}>Add Availability</button>
                    <div>
                        <h2>Personal Sessions</h2>
                        <ul>
                            {personalSessions.map(session => (
                                <li key={session.session_id}>
                                    <div>
                                        <strong>{session.session_name}</strong>
                                        <p>Start Date: {session.start_date}</p>
                                        <p>End Date: {session.end_date}</p>
                                    </div>
                                    <button onClick={() => handleDeletePersonalSession(session.session_id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainer;
