import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ask', async (req, res) => {
    const { messages, system } = req.body;
    const userMessage = messages[0].content;

    const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: userMessage }
                ]
            })
        }
    );

    const data = await response.json();
    res.json(data);
});

app.listen(3002, () => console.log('Proxy on port 3002'));