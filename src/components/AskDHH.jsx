import '../styles/AskDhh.css';
import { useState } from 'react';

function AskDHH() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [convo, setConvo] = useState([]);
    const [thinking, setThinking] = useState(false);


    const handleSend = async () => {
        if (!input.trim()) return;
        setThinking(true);
        setConvo([...convo, { type: 'user', text: input }]);
        setInput('');
        try {
            // 1. Fetch all data from Railway
            const [artistsRes, tracksRes, eventsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/artists`),
                fetch(`${import.meta.env.VITE_API_URL}/tracks`),
                fetch(`${import.meta.env.VITE_API_URL}/events`)
            ]);
            const [artists, tracks, events] = await Promise.all([
                artistsRes.json(),
                tracksRes.json(),
                eventsRes.json()
            ]);

            // 2. Build context string
            const context = `
                    ARTISTS: ${JSON.stringify(artists)}
                    TRACKS: ${JSON.stringify(tracks)}
                    EVENTS: ${JSON.stringify(events)}`;

            // 3. Call Claude API
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1000,
                    system: `You are Ask DHH, an assistant for a Desi Hip Hop website. 
                            Answer questions ONLY about the artists, tracks, and events provided in the context.
                            If the answer is not in the context, say you don't have that information.
                            Never make up information. Refuse inappropriate requests politely.
                            Always respond in this exact JSON format:
                            {"message": "your response here", "cards": []}
                            For cards, use: {"type": "artist"|"track"|"event", "slug": "the-slug"}`,
                    messages: [
                        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${input}` }
                    ]
                })
            });

            const data = await response.json();
            const text = data.content[0].text;
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