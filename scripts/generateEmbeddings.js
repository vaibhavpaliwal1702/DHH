import fs from 'fs';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
pg.types.setTypeParser(1082, val => val);

const chunks = [];

try {
    const artistResult = await pool.query('SELECT artistid, name, description, slug FROM artists');
    artistResult.rows.forEach((artist) => {
        chunks.push({
            text: `${artist.name} is a DHH artist. ${artist.name} profile: ${artist.description || ''}`,
            type: 'artist',
            slug: artist.slug
        });
    });

    const trackResult = await pool.query(`
        SELECT TR.trackid,
                TR.name,
                TR.release_date,
                TR.description,
                TR.coverimage,
                TR.slug,
                TR.type,
                ART.name AS artist_name
        FROM tracks TR
        JOIN artists ART ON ART.artistid = TR.artistid
    `);
    trackResult.rows.forEach((track) => {
        chunks.push({
            text: `Track: ${track.name} | Artist: ${track.artist_name} | Type: ${track.type} | Year: ${track.release_date} | Slug: ${track.slug}`,
            type: 'track',
            slug: track.slug
        });
    });

    const eventResult = await pool.query(`
        SELECT ET.eventid,
                ET.name,
                ET.description,
                ET.venue,
                ET.city,
                ET.country,
                ET.eventdate,
                ET.paymenturl,
                ET.image,
                ET.slug,
                COALESCE(ARRAY_AGG(ART.name) FILTER (WHERE ART.name IS NOT NULL), ARRAY['TBA']) AS artist_name
        FROM events ET
        LEFT JOIN eventartists EA ON ET.eventid = EA.eventid
        LEFT JOIN artists ART ON ART.artistid = EA.artistid
        GROUP BY ET.eventid,
                    ET.name,
                    ET.description,
                    ET.venue,
                    ET.city,
                    ET.country,
                    ET.eventdate,
                    ET.paymenturl,
                    ET.image,
                    ET.slug
        ORDER BY ET.eventid
    `);
    eventResult.rows.forEach((eventRow) => {
        const artists = Array.isArray(eventRow.artist_name)
            ? eventRow.artist_name.join(', ')
            : eventRow.artist_name;

        chunks.push({
            text: `Event: ${eventRow.name} | Date: ${eventRow.eventdate} | Venue: ${eventRow.venue} | City: ${eventRow.city} | Artists: ${artists} | Slug: ${eventRow.slug}`,
            type: 'event',
            slug: eventRow.slug
        });
    });

    const response = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.JINA_API_KEY}`
        },
        body: JSON.stringify({
            model: 'jina-embeddings-v3',
            input: chunks.map((chunk) => chunk.text)
        })
    });

    if (!response.ok) {
        throw new Error(`Embedding request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const embeddings = chunks.map((chunk, i) => ({
        ...chunk,
        embedding: data.data[i].embedding
    }));

    fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync('./data/embeddings.json', JSON.stringify(embeddings, null, 2));
    console.log(`Generated ${embeddings.length} embeddings`);
} catch (error) {
    console.error('Error generating embeddings:', error);
    process.exitCode = 1;
} finally {
    await pool.end();
}