import React, {useEffect, useState} from 'react';
const Admin = () => {
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedClassName, setSelectedClassName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [groupSessions, setGroupSessions] = useState<any[]>([]);
    const [monthlyIncomeBreakdown, setMonthlyIncomeBreakdown] = useState(
        {
            membershipIncome: 0,
            personalSessionIncome: 0,
            groupSessionIncome: 0,
            totalIncome: 0
        }
    );
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        fetch('/api/equipment')
            .then(response => response.json())
            .then(data => setEquipmentList(data))
            .catch(error => console.error('Error fetching equipment:', error));
        fetch('/api/rooms')
            .then(response => response.json())
            .then(data => setRooms(data))
            .catch(error => console.error('Error fetching rooms:', error));
        fetch('/api/group-sessions')
            .then(response => response.json())
            .then(data => setGroupSessions(data))
            .catch(error => console.error('Error fetching group sessions:', error));
        fetch('/api/monthly-income-breakdown')
            .then(response => response.json())
            .then(data =>
            {
                setMonthlyIncomeBreakdown(data);
                setLoading(false);
                console.log(data.membershipIncome);
            })
            .catch(error => console.error('Error fetching monthly income breakdown:', error));

    }, []);

    const handleMaintenance = (equipmentId: number) =>
    {
        fetch(`/api/equipment/${equipmentId}/maintenance`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({}),
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Maintenance performed for equipment ID: ${equipmentId}`);
                    fetch('/api/equipment')
                        .then(response => response.json())
                        .then(data => setEquipmentList(data))
                        .catch(error => console.error('Error fetching equipment:', error));
                } else {
                    console.error('Failed to perform maintenance:', response.status);
                }
            })
            .catch(error => console.error('Error performing maintenance:', error));
    };

    const addClass = async (className : string, startTime : any, endTime : any, room: any) =>
    {
        try
        {
            const response = await fetch('/api/add-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ className, startTime, endTime, room }),
            });

            if (response.ok)
            {
                alert('Class added successfully');
                fetch('/api/group-sessions')
                    .then(response => response.json())
                    .then(data => setGroupSessions(data))
                    .catch(error => console.error('Error fetching group sessions:', error));
                return true;
            }
            else
            {
                alert('Failed to add class');
                return false;
            }
        }
        catch (error)
        {
            console.error('Error adding class:', error);
            return false;
        }
    };

    const handleDeleteGroupSession = (sessionId: any) =>
    {
        fetch(`/api/group-sessions/${sessionId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok)
                {
                    setGroupSessions(groupSessions.filter(session => session.session_id !== sessionId));
                    console.log(`Group session with ID ${sessionId} deleted successfully.`);
                }
                else
                {
                    console.error(`Failed to delete group session with ID ${sessionId}:`, response.status);
                }
            })
            .catch(error => console.error(`Error deleting group session with ID ${sessionId}:`, error));
    };

    const handleAddGroupClass = async (e: any) =>
    {
        e.preventDefault();
        const success = await addClass(selectedClassName, startTime, endTime, selectedRoom);
    };

    const sessionsWithRooms = groupSessions.map(session =>
    {
        const sessionRoom = rooms.find(room => room.room_id === session.room_id);
        return {
            ...session,
            room: sessionRoom ? sessionRoom.room_name : 'Unknown Room',
        };
    });

    return (
        <div>
            <h2>Equipment Maintenance</h2>
            <table>
                <thead>
                <tr>
                    <th>Equipment Name</th>
                    <th>Last Maintained Date</th>
                    <th>Maintenance Frequency</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {equipmentList.map(equipment => (
                    <tr key={equipment.equipment_id}>
                        <td>{equipment.name}</td>
                        <td>{equipment.last_maintained_date.toString()}</td>
                        <td>Every {equipment.maintenance_frequency.toString()} days</td>
                        <td>
                            <button onClick={() => handleMaintenance(equipment.equipment_id)}>Do maintenance</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <h2>Add Group Class</h2>
            <form onSubmit={handleAddGroupClass}>
                <label htmlFor="class-name">Class Name:</label>
                <input type="text" id="class-name" value={selectedClassName} onChange={e => setSelectedClassName(e.target.value)} required />
                <label htmlFor="start-time">Start Time:</label>
                <input type="datetime-local" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                <label htmlFor="end-time">End Time:</label>
                <input type="datetime-local" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                <label htmlFor="room">Room:</label>
                <select id="room" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} required>
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                        <option key={room.room_id} value={room.room_id}>{room.room_name}</option>
                    ))}
                </select>
                <button type="submit">Add Group Class</button>
            </form>
            <h2>Rooms and Sessions</h2>
            {rooms.map(room => (
                <div key={room.room_id}>
                    <h3>{room.room_name}</h3>
                    <ul>
                        {sessionsWithRooms
                            .filter(session => session.room_id === room.room_id)
                            .map(session => (
                                <li key={session.session_id}>
                                    {session.start_time} - {session.end_time}: {session.session_name}
                                    <button onClick={() => handleDeleteGroupSession(session.session_id)}>Delete</button>
                                </li>
                            ))}
                    </ul>
                </div>
            ))}
            <div>
                <h2>Monthly Income Breakdown</h2>
                <p>Membership Income: ${monthlyIncomeBreakdown.membershipIncome}</p>
                <p>Personal Session Income: ${monthlyIncomeBreakdown.personalSessionIncome}</p>
                <p>Group Session Income: ${monthlyIncomeBreakdown.groupSessionIncome}</p>
                <p>Total Income: ${monthlyIncomeBreakdown.totalIncome}</p>
            </div>
        </div>
    );
};

export default Admin;
