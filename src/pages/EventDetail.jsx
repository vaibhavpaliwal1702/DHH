import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import '../styles/EventDetail.css';

function EventDetail() {
    const navigate = useNavigate();

    const { slug } = useParams();
    const { data: eventData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/events?slug=${slug}`)
    const event = eventData[0];

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    if (!event) {
        return <p>Event not found.</p>;
    }

    const date = new Date(event.eventdate).toLocaleDateString('en-GB');
    return (
        <div>
            <button onClick={() => navigate(-1)} className="back_link_event">
                ← Back
            </button>
            <div className="EventDetailScreen">
                <img src={event.image} alt={event.image} className='event_image' />
                <div className="event_info">
                    <h1>{event.name}</h1>
                    <p className="event_date">Date: {date}</p>
                    <p className="event_venue">Venue: {event.venue}, {event.city}</p>
                    <p className="event_artist">Artists: {event.artist_name.join(", ")}</p>
                </div>
            </div>
        </div>
    )
}

export default EventDetail;