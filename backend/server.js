import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
pg.types.setTypeParser(1082, val => val);

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
        const baseQuery = `SELECT ET.EVENTID, ET.NAME, ET.DESCRIPTION, ET.VENUE, ET.CITY, ET.COUNTRY, ET.EVENTDATE, ET.PAYMENTURL, ET.IMAGE, ET.SLUG, COALESCE(ARRAY_AGG(ART.NAME) FILTER (WHERE ART.NAME IS NOT NULL), ARRAY['TBA']) AS ARTIST_NAME FROM EVENTS ET LEFT JOIN EVENTARTISTS EA ON ET.EVENTID = EA.EVENTID LEFT JOIN ARTISTS ART ON ART.ARTISTID = EA.ARTISTID`;
        const Group = ` GROUP BY ET.EVENTID, ET.NAME, ET.DESCRIPTION, ET.VENUE, ET.CITY, ET.COUNTRY, ET.EVENTDATE, ET.PAYMENTURL, ET.IMAGE, ET.SLUG ORDER BY ET.EVENTID;`;
        const query = slug ? `${baseQuery} WHERE ET.SLUG = $1 ${Group}` : `${baseQuery} ${Group}`;
        const params = slug ? [slug] : [];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));