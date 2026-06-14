import embeddings from '../data/embeddings.json' with { type: 'json' };

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {

        const { messages, system } = req.body;
        const userQuery = messages[0].content;

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
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error('api/ask error:', err);
        return res.status(500).json({ error: err.message });
    }
}