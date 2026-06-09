import { Link } from 'react-router-dom';
import '../styles/EventCard.css';


function EventCard({slug,title,date,venue,city,artist,image}) {
    return (
            <div className="event-card">
                <img src={image} alt={title} className="event-img" />
                <p className="event-name">{title}</p>
                <p className="event-date">{date}</p>
                <p className="event-venue">{venue}</p>
                <p className="event-city">{city}</p>
                <p className="event-artist">{artist}</p>
            <Link to={`/events/${slug}`}>
                <button className="event-btn" type='button'>Buy Tickets</button>
            </Link>
            </div>
    );
}

export default EventCard;