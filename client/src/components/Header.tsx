import React from 'react';
import { Link } from 'react-router-dom';

const Header = () =>
{
    return (
        <header style={{ textAlign: 'center' }}>
            <nav>
                <h1>Fitness Club</h1>
                <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'center', padding: 0 }}>
                    <li style={{ margin: '0 10px' }}>
                        <Link to="/member">Member</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                        <Link to="/trainer">Trainer</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                        <Link to="/admin">Admin</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
