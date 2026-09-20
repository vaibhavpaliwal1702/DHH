// Seeds real DHH artists, their tracks, and event lineups from scripts/dhhSeedData.json.
//
// Dry run (default, read-only):  node --env-file=.env scripts/seedDhh.mjs
// Write for real:                node --env-file=.env scripts/seedDhh.mjs --apply
//
// Target DB: SEED_DATABASE_URL if set, otherwise DATABASE_URL. Idempotent: rows whose
// slug already exists (and existing event/artist links) are skipped, never overwritten.
import pg from 'pg';
import fs from 'node:fs';

const APPLY = process.argv.includes('--apply');
const url = process.env.SEED_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw new Error('Set SEED_DATABASE_URL or DATABASE_URL');

const host = new URL(url).hostname;
const isLocal = ['localhost', '127.0.0.1'].includes(host);
const data = JSON.parse(fs.readFileSync(new URL('./dhhSeedData.json', import.meta.url), 'utf8'));

const client = new pg.Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log(`Target: ${host} (${APPLY ? 'APPLY' : 'dry run, nothing will be written'})`);

  const q = async (sql, params) => (await client.query(sql, params)).rows;
  const existingArtists = new Map((await q('SELECT artistid, slug FROM artists')).map(r => [r.slug, r.artistid]));
  const existingTrackSlugs = new Set((await q('SELECT slug FROM tracks')).map(r => r.slug));
  const eventIds = new Map((await q('SELECT eventid, slug FROM events')).map(r => [r.slug, r.eventid]));

  // Validate references up front so we fail before writing anything.
  const artistSlugs = new Set(data.artists.map(a => a.slug));
  for (const t of data.tracks) {
    if (!artistSlugs.has(t.artist) && !existingArtists.has(t.artist)) throw new Error(`Track ${t.slug}: unknown artist ${t.artist}`);
  }
  for (const [eventSlug, slugs] of Object.entries(data.eventLinks)) {
    if (!eventIds.has(eventSlug)) throw new Error(`Unknown event slug: ${eventSlug}`);
    for (const s of slugs) if (!artistSlugs.has(s) && !existingArtists.has(s)) throw new Error(`Event ${eventSlug}: unknown artist ${s}`);
  }

  const newArtists = data.artists.filter(a => !existingArtists.has(a.slug));
  const newTracks = data.tracks.filter(t => !existingTrackSlugs.has(t.slug));
  const linkCount = Object.values(data.eventLinks).reduce((n, s) => n + s.length, 0);
  console.log(`Artists: ${newArtists.length} new, ${data.artists.length - newArtists.length} already present`);
  console.log(`Tracks:  ${newTracks.length} new, ${data.tracks.length - newTracks.length} already present`);
  console.log(`Event links: up to ${linkCount} (existing links are skipped)`);
  if (!APPLY) return console.log('\nDry run only. Re-run with --apply to write.');

  await client.query('BEGIN');
  try {
    for (const a of newArtists) {
      const [row] = await q(
        'INSERT INTO artists (name, description, image, slug) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING RETURNING artistid',
        [a.name, a.description, '/artists/placeHolder.jpg', a.slug]
      );
      if (row) existingArtists.set(a.slug, row.artistid);
    }
    for (const t of newTracks) {
      await q(
        'INSERT INTO tracks (name, release_date, description, coverimage, artistid, slug, type) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING',
        [t.name, `${t.year}-01-01`, t.description ?? null, '/MusicCover/placeHolder.jpg', existingArtists.get(t.artist), t.slug, t.type]
      );
    }
    let links = 0;
    for (const [eventSlug, slugs] of Object.entries(data.eventLinks)) {
      for (const s of slugs) {
        const res = await client.query(
          'INSERT INTO eventartists (eventid, artistid) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [eventIds.get(eventSlug), existingArtists.get(s)]
        );
        links += res.rowCount;
      }
    }
    await client.query('COMMIT');
    console.log(`Done. Inserted ${newArtists.length} artists, ${newTracks.length} tracks, ${links} event links.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

main().catch(err => { console.error('Seeding failed:', err.message); process.exitCode = 1; }).finally(() => client.end());
