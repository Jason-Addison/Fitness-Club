import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MemberProfile = () => {
    const { memberId } = useParams();
    const [member, setMember] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [datapoints, setDatapoints] = useState<any[]>([]);

    useEffect(() =>
    {
        fetch('/api/goals')
            .then(response => response.json())
            .then(data => setGoals(data))
            .catch(error => console.error('Error fetching goals:', error));
        fetch(`/api/members/` + memberId)
            .then(response => response.json())
            .then(data => setMember(data))
            .catch(error => console.error('Error fetching member:', error));

        fetch(`/api/datapoints?member_id=${memberId}`)
            .then(response => response.json())
            .then(data => setDatapoints(data))
            .catch(error => console.error('Error fetching member goals:', error));
    }, [memberId]);

    return (
        <div>
            {member ? (
                <div>
                    <h2>{member.name}</h2>
                    <p>Height: {member.height} cm</p>
                    <h3>Goals:</h3>
                    <ul>
                        {datapoints.length > 0 && (
                            <div>
                                <ul>
                                    {datapoints.map((datapoint, index) => {
                                        const isFirstDatapoint = index === 0 || datapoints[index - 1].goal_id !== datapoint.goal_id;
                                        const goalName = goals[datapoint.goal_id].name;
                                        return (
                                            <>
                                                {isFirstDatapoint && (
                                                    <li>
                                                        <div>
                                                            <strong>{goalName}</strong>
                                                        </div>
                                                    </li>
                                                )}
                                                <div>
                                                    {datapoint.value}   -   {datapoint.created_at}
                                                </div>
                                            </>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </ul>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default MemberProfile;
