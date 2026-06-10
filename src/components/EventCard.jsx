import { Link } from 'react-router-dom';
import '../styles/EventCard.css';


function EventCard({slug,title,date,venue,city,artist,image}) {

    const formattedDate = new Date(date).toLocaleDateString('en-US');

    return (
            <div className="event-card">
                <img src={image} alt={title} className="event-img" />
                <p className="event-name">{title}</p>
                <p className="event-date">{formattedDate}</p>
                <p className="event-venue">{venue} | {city}</p>
                <p className="event-artist">{artist}</p>
            <Link to={`/events/${slug}`}>
                <button className="event-btn" type='button'>Buy Tickets</button>
            </Link>
            </div>
    );
}

export default EventCard;