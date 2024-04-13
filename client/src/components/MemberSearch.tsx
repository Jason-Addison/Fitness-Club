import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MemberSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const handleSearch = async () =>
    {
        try
        {
            const response = await fetch(`/api/members?search=${searchQuery}`);
            if (response.ok)
            {
                const data = await response.json();
                setSearchResults(data);
            }
            else
            {
                console.error('Failed to fetch search results');
            }
        }
        catch (error)
        {
            console.error('Error searching members:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search members..."
            />
            <button onClick={handleSearch}>Search</button>
            <ul>
                {searchResults.map(member => (
                    <li key={member.member_id}>
                        <Link to={`/memberprofile/${member.member_id}`}>{member.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemberSearch;
