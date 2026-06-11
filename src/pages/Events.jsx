import '../styles/Events.css'
import EventCard from '../components/EventCard.jsx';
import { useState } from 'react';
import useFetch from '../hooks/useFetch';

function Events() {

    const [searchTerm, setSearchTerm] = useState('');
    const { data: eventData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/events`)


    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    const sortedEvents = [...eventData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
    const filteredEvents = sortedEvents.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="events-header">
                <h2>Events</h2>
            </div>
            <input type="text" placeholder="Search Events..." className="search-bar-events" onChange={(e) => setSearchTerm(e.target.value)} />
            <div className="EventScreen">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
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
                    ))
                ) : (
                    <p>No Events found.</p>
                )}
            </div>
        </div>
    )
}

export default Events
