import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
    return <nav className='global-nav'>
        <span className='DHH'><Link to="/">DHH</Link></span>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/artists">Artists</Link></li>
            <li><Link to="/music">Music</Link></li>
            <li><Link to="/events">Events</Link></li>
        </ul>
    </nav>
}

export default Navbar;