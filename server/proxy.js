import embeddings from '../data/embeddings.json' with { type: 'json' };
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

app.post('/api/ask', async (req, res) => {

    const { messages, system } = req.body;
    const userQuery = messages[0].content;

    const tools = [
        {
            "type": "function",
            "function": {
                "name": "get_upcoming_events",
                "description": "Returns a list of upcoming events sorted by date, starting from today.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_artists_semantic",
                "description": "Returns a list of artists based on semantic search.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query describing what the user wants to know about an artist."
                        }
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_event_by_slug",
                "description": "Returns information about a specific event by its slug.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "slug": {
                            "type": "string",
                            "description": "The slug of the event to retrieve."
                        }
                    },
                    "required": ["slug"]
                }
            }
        }
    ]

    // 1. Embed the query
    const embedRes = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.JINA_API_KEY}`
        },
        body: JSON.stringify({
            model: 'jina-embeddings-v3',
            input: [userQuery]
        })
    });

    const embedData = await embedRes.json();
    const queryEmbedding = embedData.data[0].embedding;

    // 2. Compute similarity and get top 3
    const scored = embeddings.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, 3);

    // 3. Build context from top chunks only
    const context = topChunks.map(c => c.text).join('\n');

    // 4. Call Groq with minimal context
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: `${system}\n\nCONTEXT:\n${context}` },
                { role: 'user', content: userQuery }
            ],
            tools: tools
        })
    });

    const data = await response.json();
    return res.status(200).json(data);

});
app.listen(3002, () => console.log('Proxy on port 3002'));