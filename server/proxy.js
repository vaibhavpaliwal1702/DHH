import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ask', async (req, res) => {
    const { messages, system } = req.body;
    const userMessage = messages[0].content;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `${system}\n\n${userMessage}` }] }]
            })
        }
    );

    const data = await response.json();
    res.json(data);
});

app.listen(3002, () => console.log('Proxy on port 3002'));