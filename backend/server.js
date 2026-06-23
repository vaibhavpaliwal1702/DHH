import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/artists', async (req, res) => {
    const { slug } = req.query;
    try {
        let result;
        if (slug) {
            result = await pool.query('SELECT * FROM artists WHERE slug = $1', [slug]);
        } else {
            result = await pool.query('SELECT * FROM artists');
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/tracks', async (req, res) => {
    const { slug } = req.query;
    try {
        let result;
        if (slug) {
            result = await pool.query('SELECT * FROM tracks WHERE slug = $1', [slug]);
        } else {
            result = await pool.query('SELECT * FROM tracks');
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/events', async (req, res) => {
    const { slug } = req.query;
    try {
        let result;
        if (slug) {
            result = await pool.query('SELECT * FROM events WHERE slug = $1', [slug]);
        } else {
            result = await pool.query('SELECT * FROM events');
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));