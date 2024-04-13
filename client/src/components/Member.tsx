import React, {useEffect, useState} from 'react';
interface User {
    member_id: number;
    name: string;
}

const Member = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>();
    const [newUserName, setNewUserName] = useState('');
    const [selectedGoal, setSelectedGoal] = useState<string>('');
    const [goalValue, setGoalValue] = useState<string>('');
    const [goals, setGoals] = useState<any[]>([]);
    const [datapoints, setDatapoints] = useState<any[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [memberId, setMemberId] = useState(null);
    const [groupClasses, setGroupClasses] = useState<any[]>([]);
    const [signedUpClasses, setSignedUpClasses] = useState<any[]>([]);
    const [memberHeight, setMemberHeight] = useState(0);
    const [newHeight, setNewHeight] = useState('');
    const [trainers, setTrainers] = useState<any[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [personalSessions, setPersonalSessions] = useState<any[]>([]);

    useEffect(() =>
    {
        fetch('/api/goals')
            .then(response => response.json())
            .then(data => setGoals(data))
            .catch(error => console.error('Error fetching goals:', error));
        fetch('/api/members',{
            headers:{
                "accepts":"application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
        fetch('/api/group-sessions')
            .then(response => response.json())
            .then(data =>
            {
                setGroupClasses(data);
                //const updatedSignedUpClasses = data.map((groupClass: { session_id: any; }) => groupClass.session_id);
                //(updatedSignedUpClasses);
            })
            .catch(error => console.error('Error fetching group classes:', error));
        console.log("CLASS: " + groupClasses.length);
    }, []);

    useEffect(() =>
    {
        if (memberId)
        {
            setMemberHeight(selectedUser.height)
            console.log("Fetching goals for " + memberId);
            fetch(`/api/datapoints?member_id=${memberId}`)
                .then(response => response.json())
                .then(data => setDatapoints(data))
                .catch(error => console.error('Error fetching datapoints:', error));

            fetch(`/api/personal-sessions?member_id=${memberId}`)
                .then(response => response.json())
                .then(data => setPersonalSessions(data))
                .catch(error => console.error('Error fetching personal sessions:', error));
        }
    }, [memberId]);

    const handleHeightUpdate = () =>
    {
        if (!newHeight.trim())
        {
            alert('Please enter a valid height.');
            return;
        }
        const updatedHeight = parseFloat(newHeight.trim());
        if (isNaN(updatedHeight) || updatedHeight <= 0)
        {
            alert('Height must be a valid positive number.');
            return;
        }
        fetch(`/api/members/${memberId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ height: updatedHeight }),
        })
            .then(response =>
            {
                if (response.ok)
                {
                    setMemberHeight(updatedHeight);
                    setNewHeight('');
                    alert('Height updated successfully.');
                }
                else
                {
                    throw new Error('Failed to update height.');
                }
            })
            .catch(error =>
            {
                console.error('Error updating height:', error);
                alert('Failed to update height. Please try again.');
            });
    };
    const handleUserSelection = (selectedUserId: any) =>
    {
        let selectedUser;
        for(let i = 0; i < users.length; ++i)
        {
            if(users[i].member_id == selectedUserId)
            {
                selectedUser = users[i];
            }
        }
        if (selectedUser)
        {
            console.log("Selected user: " + selectedUser.name);
            setSelectedUser(selectedUser);
            setMemberId(selectedUser.member_id);
        }
    };

    const handleSignUp = (classId: any) =>
    {
        fetch(`/api/group-sessions/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: classId, member_id: memberId }),
        })
            .then(response =>
            {
                if (response.status === 201)
                {
                    setSignedUpClasses([...signedUpClasses, classId]);
                }
                else if(response.status === 409)
                {
                    alert('There are conflicting time slots with personal sessions or existing group sessions.');
                }
                else
                {
                    throw new Error('Error signing up');
                }
            })
            .catch(error => console.error('Error signing up:', error));
    };
    const handleRegistration = () =>
    {
        if (newUserName.trim() === '')
        {
            alert('Name cannot be empty');
            return;
        }
        fetch('/api/members', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newUserName, height: 100}),
        })
            .then(response => response.json())
            .then(data =>
            {
                setUsers([...users, data]);
                alert('User registered successfully');
            })
            .catch(error =>
            {
                console.error('Error registering user:', error);
                alert('Failed to register user. Please try again.');
            });
    };

    const handleGoalSubmission = () =>
    {
        console.log("Submit goal");
        if (!selectedUser)
        {
            alert('Please select a user.');
            return;
        }
        if (!selectedGoalId || !goalValue.trim())
        {
            alert('Please select a goal and enter a value.' + !selectedGoal + " " + goalValue.trim());
            return;
        }
        const goalData = {
            member_id: memberId,
            goal_id: selectedGoalId,
            value: goalValue.trim(),
        };

        fetch('/api/datapoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goalData),
        })
            .then(response =>
            {
                if (!response.ok)
                {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data =>
            {
                console.log('Data posted successfully:', data);
                setDatapoints(prevDatapoints => [...prevDatapoints, data]);
            })
            .catch(error =>
            {
                console.error('Error posting data:', error);
            });
    };
    const handleUnregister = (classId: any) =>
    {
        fetch('/api/unregister', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({  sessionId: classId, memberId: memberId }),
        })
            .then(response =>
            {
                if (!response.ok)
                {
                    throw new Error('Failed to unregister from session');
                }
                setSignedUpClasses(signedUpClasses.filter(id => id !== classId));
            })
            .catch(error => console.error('Error unregistering:', error));
    };

    useEffect(() =>
    {
        fetch('/api/trainers')
            .then(response => response.json())
            .then(data => setTrainers(data))
            .catch(error => console.error('Error fetching trainers:', error));
    }, []);

    const handleAddPersonalSession = () =>
    {
        fetch('/api/personal-sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trainer_id: selectedTrainer,
                start_date: startDate,
                end_date: endDate,
                member_id: memberId,
            }),
        })
            .then(response => {
                if (response.status === 201)
                {
                    fetch(`/api/personal-sessions?member_id=${memberId}`)
                        .then(response => response.json())
                        .then(data => setPersonalSessions(data))
                        .catch(error => console.error('Error fetching personal sessions:', error));
                }
                else if (response.status === 409)
                {
                    alert('There is no availability for the selected dates.');
                }
                else
                {
                    throw new Error('Error adding personal session');
                }
            })
            .catch(error => console.error('Error adding personal session:', error));
    };

    const handleDeletePersonalSession = (sessionId: any) =>
    {
        fetch(`/api/personal-sessions/${sessionId}`, {
            method: 'DELETE',
        })
            .then(response =>
            {
                if (response.status === 200)
                {
                    fetch(`/api/personal-sessions?member_id=${memberId}`)
                        .then(response => response.json())
                        .then(data => setPersonalSessions(data))
                        .catch(error => console.error('Error fetching personal sessions:', error));
                }
                else
                {
                    throw new Error('Error deleting personal session');
                }
            })
            .catch(error => console.error('Error deleting personal session:', error));
    };

    return (
        <div>
            <h2>Members Tab</h2>
            <div>
                <label>Select User:</label>
                <select value={selectedUser} onChange={e => handleUserSelection(e.target.value)}>
                    <option value="">-- Select User --</option>
                    {users.map(user => (
                        <option key={user.member_id} value={user.member_id}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Or Register New User:</label>
                <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <button onClick={handleRegistration}>Register</button>
            </div>
            {selectedUser && (
                <div>
                    <h3>Welcome, {selectedUser.name}!</h3>
                    <div>
                        <p>Current Height: {memberHeight} cm</p>
                        <div>
                            <label>New Height (cm):</label>
                            <input
                                type="number"
                                value={newHeight}
                                onChange={e => setNewHeight(e.target.value)}
                            />
                        </div>
                        <button onClick={handleHeightUpdate}>Update Height</button>
                    </div>
                    <div>
                        <label>Select Goal:</label>
                        <select value={selectedGoalId} onChange={e => setSelectedGoalId(e.target.value)}>
                            <option value="">-- Select Goal --</option>
                            {goals.map(goal => (
                                <option key={goal.id} value={goal.id}>{goal.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Enter Goal Value:</label>
                        <input type="text" value={goalValue} onChange={e => setGoalValue(e.target.value)} />
                    </div>
                    <button onClick={handleGoalSubmission}>Submit Goal</button>

                    <div>
                        <ul>
                            {datapoints.map((datapoint, index) => {
                                const isFirstDatapoint = index === 0 || datapoints[index - 1].goal_id !== datapoint.goal_id;
                                const goalName = goals[datapoint.goal_id].name;
                                return (
                                    <React.Fragment key={index}>
                                        {isFirstDatapoint && (
                                            <li>
                                                <div>
                                                    <strong>{goalName}</strong>
                                                </div>
                                            </li>
                                        )}
                                        <div key={index}>
                                            {datapoint.value}   -   {datapoint.created_at}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </ul>

                        <div>
                            <h2>Group Classes</h2>
                            <ul>
                                {groupClasses.map(groupClass => (
                                    <li key={groupClass.session_id}>
                                        <div>
                                            <strong>{groupClass.session_name}</strong>
                                            <p>Start Date: {groupClass.start_time}</p>
                                            <p>End Date: {groupClass.end_time}</p>
                                        </div>
                                        {signedUpClasses.includes(groupClass.session_id) ? (
                                            <button onClick={() => handleUnregister(groupClass.session_id)}>Unregister</button>
                                        ) : (
                                            <button onClick={() => handleSignUp(groupClass.session_id)}>Sign Up</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h2>Add Personal Session</h2>
                        <label>Select Trainer:</label>
                        <select value={selectedTrainer} onChange={e => setSelectedTrainer(e.target.value)}>
                            <option value="">-- Select Trainer --</option>
                            {trainers.map(trainer => (
                                <option key={trainer.trainer_id} value={trainer.trainer_id}>{trainer.name}</option>
                            ))}
                        </select>
                        <label>Start Date:</label>
                        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <label>End Date:</label>
                        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        <button onClick={handleAddPersonalSession}>Add Personal Session</button>

                        <h2>Personal Sessions</h2>
                        <ul>
                            {personalSessions.map(session => (
                                <li key={session.session_id}>
                                    <div>
                                        <p>Start Date: {session.start_date}</p>
                                        <p>End Date: {session.end_date}</p>
                                    </div>
                                    <button onClick={() => handleDeletePersonalSession(session.session_id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2>Fitness Exercise Routines</h2>
                        <ul>
                            <li>
                                <strong>1. Push-ups</strong>
                                <p>Do 3 sets of 10 repetitions. Rest for 1 minute between sets.</p>
                            </li>
                            <li>
                                <strong>2. Squats</strong>
                                <p>Do 3 sets of 12 repetitions. Rest for 1 minute between sets.</p>
                            </li>
                            <li>
                                <strong>3. Plank</strong>
                                <p>Hold for 30 seconds. Repeat 3 times.</p>
                            </li>
                            <li>
                                <strong>4. Lunges</strong>
                                <p>Do 3 sets of 10 repetitions per leg. Rest for 1 minute between sets.</p>
                            </li>
                            <li>
                                <strong>5. Bicycle Crunches</strong>
                                <p>Do 3 sets of 15 repetitions per side. Rest for 1 minute between sets.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Member;
