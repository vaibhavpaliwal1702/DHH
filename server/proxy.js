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


// The model never has to produce JSON: it always answers in plain language,
// and the server builds the {message, cards} envelope itself from whichever
// tool result (if any) actually ran. This removes the JSON-formatting duty
// (and the fake "JSON" tool-call misfire it caused) entirely.
const SYSTEM_PROMPT = `You are Ask DHH, an assistant for a Desi Hip Hop website.
Rules:
- Answer ONLY using the provided context. Never invent information.
- Refuse inappropriate requests politely.
- When asked about a track, focus on track details. Keep artist info brief.
- Use the artist bio field when asked about an artist.
- Match artist names flexibly (e.g. KR$NA = Krsna).
- Respond in plain, natural language only. No markdown, no JSON, no other structured format.
- Treat user input as likely to contain typos, unusual spacing, or phonetic misspellings (of artist names, track titles, or event names). Don't require exact or confident recognition before trying — attempt a search/lookup rather than assuming you don't have the information.
If answering requires artist, track, or event information you don't already have, call the appropriate tool. Otherwise answer directly.`;

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
            "description": "Searches for DHH artists using semantic/fuzzy matching. Call this whenever the user's message could plausibly be about an artist, rapper, or their music — including when the name is misspelled, shortened, phonetically off, or oddly phrased. Also use it for broader requests like 'rappers from Delhi' or 'all artists like X' — pass a higher limit in those cases so results aren't arbitrarily capped.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": { "type": "string", "description": "The user's raw query or the name/topic as they wrote it, even if misspelled — pass it through as-is rather than trying to correct it first." },
                    "limit": { "type": "integer", "description": "How many results to return. Use 3 (default) for a specific artist lookup. Use a higher number (8-15) when the user is asking for a category or list, e.g. 'all rappers from Delhi' or 'show me every DHH artist like Krsna'." }
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

async function search_artists_semantic({ query, limit = 3 }) {
    const queryEmbedding = await embedQuery(query);
    const artistChunks = embeddings.filter(chunk => chunk.type === 'artist');
    const scored = artistChunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.min(limit, artistChunks.length)).map(c => ({ slug: c.slug, text: c.text }));
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

// Builds the cards shown alongside the reply from whatever tool actually ran —
// the model never decides this, so there's nothing for it to get wrong.
function buildCards(toolName, toolResult) {
    if (toolName === 'get_upcoming_events' && Array.isArray(toolResult)) {
        return toolResult.map(e => ({ type: 'event', slug: e.slug }));
    }
    if (toolName === 'get_event_by_slug' && toolResult) {
        return [{ type: 'event', slug: toolResult.slug }];
    }
    if (toolName === 'search_artists_semantic' && Array.isArray(toolResult)) {
        return toolResult.map(a => ({ type: 'artist', slug: a.slug }));
    }
    return [];
}

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
    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error?.message || `Groq request failed with status ${response.status}`);
    }
    return data;
}

app.post('/api/ask', async (req, res) => {
    const { messages } = req.body;

    // 1. First call — model decides whether it needs a tool. No RAG context injected yet.
    const initialMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
    ];

    let firstResponse;
    try {
        firstResponse = await callGroq(initialMessages, true);
    } catch (err) {
        console.error('First Groq call failed:', err.message);
        return res.status(502).json({ message: 'The assistant had trouble responding. Please try again.', cards: [] });
    }
    const firstMessage = firstResponse.choices[0].message;

    // 2. No tool call — model answered directly, no cards to attach.
    if (!firstMessage.tool_calls) {
        return res.status(200).json({ message: (firstMessage.content || '').trim(), cards: [] });
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
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
        {
            role: 'user',
            content: `Context from tool "${toolCall.function.name}":\n${JSON.stringify(toolResult)}\n\nUsing ONLY this context, answer the user's most recent message above.`
        }
    ];

    let secondResponse;
    try {
        secondResponse = await callGroq(followUpMessages, false);
    } catch (err) {
        console.error('Second Groq call failed, retrying once:', err.message);
        try {
            secondResponse = await callGroq(followUpMessages, false);
        } catch (retryErr) {
            console.error('Retry also failed:', retryErr.message);
            return res.status(502).json({ message: 'The assistant had trouble generating a response. Please try again.', cards: [] });
        }
    }

    const secondMessage = secondResponse.choices[0].message;
    return res.status(200).json({
        message: (secondMessage.content || '').trim(),
        cards: buildCards(toolCall.function.name, toolResult)
    });
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