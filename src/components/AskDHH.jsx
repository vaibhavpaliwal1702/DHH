import '../styles/AskDhh.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArtistImage from './ArtistImage';

function AskDHH() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [convo, setConvo] = useState([]);
    const [thinking, setThinking] = useState(false);
    const [dbData, setDbData] = useState({ artists: [], tracks: [], events: [] });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [convo, thinking]);

    useEffect(() => {
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/artists`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/tracks`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/events`).then(r => r.json())
        ]).then(([artists, tracks, events]) => {
            setDbData({ artists, tracks, events });
        });
    }, []);


    const handleSend = async () => {
        if (!input.trim()) return;
        setThinking(true);
        setConvo([...convo, { type: 'user', text: input }]);
        setInput('');
        const history = convo.map(turn =>
            turn.type === 'user'
                ? { role: 'user', content: turn.text }
                : { role: 'assistant', content: turn.message }
        );
        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: input }]
                })
            });

            const data = await response.json();
            setConvo(prev => [...prev, { type: 'assistant', message: data.message, cards: data.cards || [] }]);
        } catch (err) {
            console.error('AskDHH error:', err);
            setConvo(prev => [...prev, { type: 'assistant', message: 'Something went wrong. Try again.', cards: [] }]);
        } finally {
            setThinking(false);
        }
    };

    return (
        <div className="ask-dhh-wrapper">
            {isOpen && (
                <div className="ask-dhh-panel">
                    <div className="ask-dhh-header">
                        <h2 className="ask-dhh-title">Ask DHH</h2>
                        <button className="ask-dhh-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="ask-dhh-messages">
                        {convo.map((msg, index) => (
                            <div key={index} className={`ask-dhh-msg ask-dhh-msg--${msg.type}`}>
                                {msg.type === 'user' ? msg.text : msg.message}
                                {msg.type === 'assistant' && msg.cards && msg.cards.length > 0 && (
                                    <div className="ask-dhh-cards">
                                        {msg.cards.map((card, i) => {
                                            if (card.type === 'artist') {
                                                const artist = dbData.artists.find(a => a.slug === card.slug);
                                                if (!artist) return null;
                                                return (
                                                    <Link key={i} to={`/artists/${artist.slug}`} className="ask-dhh-card">
                                                        <ArtistImage src={artist.image} name={artist.name} className="ask-dhh-card-thumb" />
                                                        <span>{artist.name}</span>
                                                    </Link>
                                                );
                                            }
                                            if (card.type === 'track') {
                                                const track = dbData.tracks.find(t => t.slug === card.slug);
                                                if (!track) return null;
                                                return (
                                                    <Link key={i} to={`/music`} className="ask-dhh-card">
                                                        <img src={track.coverImage} alt={track.title} />
                                                        <span>{track.title}</span>
                                                    </Link>
                                                );
                                            }
                                            if (card.type === 'event') {
                                                const event = dbData.events.find(e => e.slug === card.slug);
                                                if (!event) return null;
                                                return (
                                                    <Link key={i} to={`/events/${event.slug}`} className="ask-dhh-card">
                                                        <span>{event.name}</span>
                                                        <span>. {new Date(event.eventdate).toLocaleDateString('en-US')}</span>
                                                    </Link>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        {thinking && <p className="ask-dhh-thinking">Thinking...</p>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ask-dhh-input-row">
                        <input
                            type="text"
                            placeholder="Ask anything about DHH..."
                            className="ask-dhh-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                        />
                        <button className="ask-dhh-send" onClick={handleSend}>
                            Search
                        </button>
                    </div>
                </div>
            )}
            <button className="ask-dhh-trigger" onClick={() => setIsOpen(!isOpen)}>
                Ask DHH
            </button>
        </div>
    );
}

export default AskDHH;