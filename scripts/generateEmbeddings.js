import fs from 'fs';

const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

const chunks = [];

db.artists.forEach(a => {
    chunks.push({
        text: `Artist: ${a.name} | Slug: ${a.slug} | Bio: ${a.bio}`,
        type: 'artist',
        slug: a.slug
    });
});

db.tracks.forEach(t => {
    chunks.push({
        text: `Track: ${t.title} | Artist: ${t.artist} | Type: ${t.type} | Year: ${t.releaseYear} | Slug: ${t.slug}`,
        type: 'track',
        slug: t.slug
    });
});

db.events.forEach(e => {
    chunks.push({
        text: `Event: ${e.title} | Date: ${e.date} | Venue: ${e.venue} | City: ${e.city} | Artists: ${e.artist} | Slug: ${e.slug}`,
        type: 'event',
        slug: e.slug
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
        input: chunks.map(c => c.text)
    })
});

const data = await response.json();

const embeddings = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: data.data[i].embedding
}));

fs.mkdirSync('./data', { recursive: true });
fs.writeFileSync('./data/embeddings.json', JSON.stringify(embeddings, null, 2));
console.log(`Generated ${embeddings.length} embeddings`);