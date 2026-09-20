import embeddings from '../data/embeddings.json' with { type: 'json' };
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const BACKEND_URL = process.env.VITE_API_URL;

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

const tools = [
    {
        "type": "function",
        "function": {
            "name": "get_upcoming_events",
            "description": "Returns a list of upcoming events sorted by date, starting from today.",
            "parameters": { "type": "object", "properties": {}, "required": [] }
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
                    "query": { "type": "string", "description": "The search query describing what the user wants to know about an artist." }
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
                    "slug": { "type": "string", "description": "The slug of the event to retrieve." }
                },
                "required": ["slug"]
            }
        }
    }
];

// ---- Tool implementations — only run when the model actually asks for them ----

async function embedQuery(query) {
    const embedRes = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.JINA_API_KEY}`
        },
        body: JSON.stringify({ model: 'jina-embeddings-v3', input: [query] })
    });
    const embedData = await embedRes.json();
    return embedData.data[0].embedding;
}

async function search_artists_semantic({ query }) {
    const queryEmbedding = await embedQuery(query);

    const artistChunks = embeddings.filter(chunk => chunk.type === 'artist');
    const scored = artistChunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(c => ({ slug: c.slug, text: c.text }));
}

async function get_upcoming_events() {
    const r = await fetch(`${BACKEND_URL}/events`);
    const events = await r.json();

    const now = new Date();
    return events
        .filter(e => new Date(e.eventdate) >= now)
        .sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate));
}

async function get_event_by_slug({ slug }) {
    const r = await fetch(`${BACKEND_URL}/events?slug=${encodeURIComponent(slug)}`);
    const events = await r.json();
    return events[0] ?? null;
}

const toolImpl = { get_upcoming_events, search_artists_semantic, get_event_by_slug };

// ---- Groq call helper ----

async function callGroq(messages, useTools) {
    const body = { model: 'openai/gpt-oss-120b', messages };
    if (useTools) {
        body.tools = tools;
        body.tool_choice = 'auto';
    }
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

app.post('/api/ask', async (req, res) => {
    const { messages, system } = req.body;

    // 1. First call — model decides whether it needs a tool. No RAG context injected yet.
    const initialMessages = [
        { role: 'system', content: system },
        ...messages
    ];

    const firstResponse = await callGroq(initialMessages, true);
    const firstMessage = firstResponse.choices[0].message;

    // 2. No tool call — model answered directly, done.
    if (!firstMessage.tool_calls) {
        return res.status(200).json(firstResponse);
    }

    // 3. Tool call requested — execute it, then send the result back for a real answer.
    const toolCall = firstMessage.tool_calls[0];
    const fn = toolImpl[toolCall.function.name];

    let toolResult;
    try {
        const args = JSON.parse(toolCall.function.arguments || '{}');
        toolResult = await fn(args);
    } catch (err) {
        console.error(`Tool execution failed (${toolCall.function.name}):`, err);
        toolResult = { error: 'Tool execution failed' };
    }

    const followUpMessages = [
        ...initialMessages,
        firstMessage,
        { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) }
    ];

    const secondResponse = await callGroq(followUpMessages, false);
    return res.status(200).json(secondResponse);
});

const PORT = 3002;
const server = app.listen(PORT, () => console.log(`Proxy on port ${PORT}`));
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use — another process (maybe a previous run of this proxy) is still listening. Stop it first, e.g.: netstat -ano | findstr :${PORT}`);
        process.exit(1);
    }
    throw err;
});