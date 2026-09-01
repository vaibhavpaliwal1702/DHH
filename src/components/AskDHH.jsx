import '../styles/AskDhh.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AskDHH() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [convo, setConvo] = useState([]);
    const [thinking, setThinking] = useState(false);
    const [dbData, setDbData] = useState({ artists: [], tracks: [], events: [] });

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
        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: `You are Ask DHH, an assistant for a Desi Hip Hop website.
                            Rules:
                            - Answer ONLY using the provided context. Never invent information.
                            - Refuse inappropriate requests politely.
                            - When asked about a track, focus on track details. Keep artist info brief.
                            - Use the artist bio field when asked about an artist.
                            - Match artist names flexibly (e.g. KR$NA = Krsna).
                            - Plain text only. No markdown or formatting.
                            Respond ONLY with this JSON format, no text outside it:
                            {"message": "your response here", "cards": [{"type": "artist|track|event", "slug": "slug-from-context"}]}`,
                    messages: [{ role: 'user', content: input }]
                })
            });

            const data = await response.json();
            const text = data.choices[0].message.content;
            const parsed = JSON.parse(text);
            setConvo(prev => [...prev, { type: 'assistant', message: parsed.message, cards: parsed.cards }]);
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
                                                        <img src={artist.image} alt={artist.name} />
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