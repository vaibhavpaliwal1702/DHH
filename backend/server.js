import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
pg.types.setTypeParser(1082, val => val);

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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
        const baseQuery = `SELECT TR.trackid, TR.name, TR.release_date, TR.description, TR.coverimage, TR.slug, TR.type, ART.name AS artist_name FROM tracks TR JOIN artists ART ON ART.artistid = TR.artistid`;
        const query = slug ? `${baseQuery} WHERE TR.slug = $1` : baseQuery;
        const params = slug ? [slug] : [];
        const result = await pool.query(query, params);
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

// SIGNUP
app.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Check username uniqueness — already handled by DB if you add UNIQUE constraint
        const existingUsername = await pool.query('SELECT userid FROM users WHERE username = $1', [username]);
        if (existingUsername.rows.length > 0) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const existing = await pool.query('SELECT userid FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, passwordhash) VALUES ($1, $2, $3) RETURNING userid, username, email',
            [username, email, passwordHash]
        );
        const user = result.rows[0];
        const token = jwt.sign({ userId: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.passwordhash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ user: { userid: user.userid, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// LOGOUT
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

app.get('/auth/me', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT userid, username, email FROM users WHERE userid = $1',
            [req.userId]
        );
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));