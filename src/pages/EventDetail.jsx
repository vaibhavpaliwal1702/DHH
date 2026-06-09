import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function EventDetail() {
    
    const { slug } = useParams();
    const { data: eventData, loading, error } = useFetch(`http://localhost:3001/events?slug=${slug}`)

    const event = eventData[0];

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    if (!event) {
        return <p>Event not found.</p>;
    }
    return (
        <div className="EventDetailScreen">
            <h1>{event.title}</h1>
            <p>Date: {event.date}</p>
            <p>Venue: {event.venue}</p>
            <p>City: {event.city}</p>
            <p>Artists: {event.artist}</p>
        </div>
    )
}

export default EventDetail;