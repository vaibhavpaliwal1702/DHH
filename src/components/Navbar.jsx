import '../styles/Navbar.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout, openAuthModal } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <nav className='global-nav'>
            <span className='DHH'><Link to="/">DHH</Link></span>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/artists">Artists</Link></li>
                <li><Link to="/music">Music</Link></li>
                <li><Link to="/events">Events</Link></li>
                {user ? (
                    <li className="nav-avatar-wrapper">
                        <div
                            className="nav-avatar"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {user?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        {showDropdown && (
                            <div className="nav-dropdown">
                                <Link to="/profile" onClick={() => setShowDropdown(false)}>My Profile</Link>
                                <button onClick={() => { logout(); setShowDropdown(false); }}>Logout</button>
                            </div>
                        )}
                    </li>
                ) : (
                    <li>
                        <button className="nav-login-btn" onClick={openAuthModal}>
                            Log In
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;