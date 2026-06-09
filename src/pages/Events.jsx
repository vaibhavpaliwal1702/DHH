import '../styles/Events.css'
import EventCard from '../components/EventCard.jsx';
import useFetch from '../hooks/useFetch';

function Events() {

    const { data: eventData, loading, error } = useFetch('http://localhost:3001/events')

    
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    
    const sortedEvents = [...eventData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
    
    return (
        <div className="EventScreen">
            {sortedEvents.length === 0 && (
                <p>No Events Available at the moment.</p>
            )}
            {sortedEvents.map((event) => (
                <EventCard
                    key={event.id}
                    slug={event.slug}
                    title={event.title}
                    date={event.date}
                    venue={event.venue}
                    city={event.city}
                    artist={event.artist}
                    image={event.image}
                />
            ))}
        </div>
    )
}

export default Events
