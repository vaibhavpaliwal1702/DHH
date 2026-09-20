// One-off dev seeding script: inserts ~55 random rows into every table.
// Run with: node --env-file=.env scripts/seedRandom.mjs
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const COUNT = 55;
const TEST_PASSWORD = 'TestPass123!';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const firstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Krishna','Ishaan','Shaurya','Kabir','Ayaan','Rudra','Dhruv','Arnav','Riya','Ananya','Diya','Myra','Aadhya','Pari','Anika','Navya','Kiara','Sara','Meera','Tara','Ira','Zara','Nisha','Rohan','Karan','Vikram','Aman','Yash','Neha','Priya','Simran','Tanya','Isha'];
const lastNames = ['Sharma','Verma','Gupta','Singh','Kumar','Patel','Mehta','Joshi','Reddy','Nair','Iyer','Chopra','Malhotra','Kapoor','Bose','Das','Rao','Pillai','Menon','Bhatt'];
const cities = [['Delhi','India'],['Mumbai','India'],['Bengaluru','India'],['Pune','India'],['Hyderabad','India'],['Chennai','India'],['Kolkata','India'],['Jaipur','India'],['Chandigarh','India'],['Lucknow','India'],['Ahmedabad','India'],['Goa','India']];
const venues = ['NDMC Convention Centre','Pragati Maidan','India Habitat Centre','DY Patil Stadium','Phoenix Marketcity Grounds','Jawaharlal Nehru Stadium','Prithvi Theatre','Kingdom of Dreams','Palace Grounds','Gachibowli Stadium','JLN Indoor Stadium','Zorba Amphitheatre'];
const trackTypes = ['Single','Album','EP'];
const trackAdjectives = ['Midnight','Golden','Street','Raw','Neon','Silent','Wild','Broken','Electric','Underground','Last','First','City','Desi','Fire','Ice','Royal','Rebel','Echo','Shadow'];
const trackNouns = ['Cypher','Flow','Anthem','Vibes','Bars','Groove','Rhythm','Story','Nights','Dreams','Hustle','Legacy','Journey','Kingdom','Chapter','Symphony','Freestyle','Movement','Energy','Verse'];
const artistNounsFirst = ['MC','DJ','Lil','Young','Big'];
const paymentMethods = ['UPI','Card','Netbanking','Wallet'];
const ticketStatuses = ['confirmed','pending','cancelled'];
const paymentStatuses = ['paid','pending','failed'];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ---- Artists ----
    const artistIds = [];
    const usedArtistSlugs = new Set();
    for (let i = 0; i < COUNT; i++) {
      let name = `${rand(artistNounsFirst)} ${rand(firstNames)}`;
      let slug = slugify(name);
      let n = 1;
      while (usedArtistSlugs.has(slug)) { slug = `${slugify(name)}-${n++}`; }
      usedArtistSlugs.add(slug);
      const description = `${name} is a rising name in the Desi Hip Hop scene, known for a distinct sound blending regional influences with modern rap production.`;
      const res = await client.query(
        `INSERT INTO artists (name, description, image, slug) VALUES ($1,$2,$3,$4) RETURNING artistid`,
        [name, description, '/artists/placeHolder.jpg', slug]
      );
      artistIds.push(res.rows[0].artistid);
    }

    // Include pre-existing artists as valid FK targets too
    const existingArtists = await client.query('SELECT artistid FROM artists');
    const allArtistIds = existingArtists.rows.map(r => r.artistid);

    // ---- Tracks ----
    const usedTrackSlugs = new Set();
    for (let i = 0; i < COUNT; i++) {
      const name = `${rand(trackAdjectives)} ${rand(trackNouns)}`;
      let slug = slugify(name);
      let n = 1;
      while (usedTrackSlugs.has(slug)) { slug = `${slugify(name)}-${n++}`; }
      usedTrackSlugs.add(slug);
      const releaseDate = randDate(new Date('2020-01-01'), new Date('2026-12-31'));
      const artistid = rand(allArtistIds);
      const type = rand(trackTypes);
      await client.query(
        `INSERT INTO tracks (name, release_date, description, coverimage, artistid, slug, type) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [name, releaseDate.toISOString().slice(0,10), null, '/MusicCover/placeHolder.jpg', artistid, slug, type]
      );
    }

    // ---- Events ----
    const eventIds = [];
    const usedEventSlugs = new Set();
    for (let i = 0; i < COUNT; i++) {
      const [city, country] = rand(cities);
      const name = `${city} ${rand(['Rap Fest','Hip Hop Carnival','Beat Night','Street Cypher','Music Fest','Rap Battle Finals'])}`;
      let slug = slugify(`${name}-${i}`);
      let n = 1;
      while (usedEventSlugs.has(slug)) { slug = `${slugify(name)}-${n++}`; }
      usedEventSlugs.add(slug);
      const eventDate = randDate(new Date('2025-01-01'), new Date('2027-06-30'));
      const res = await client.query(
        `INSERT INTO events (name, description, venue, city, country, eventdate, paymenturl, image, slug) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING eventid`,
        [name, null, rand(venues), city, country, eventDate.toISOString().slice(0,10), null, '/EventCover/placeHolder.jpg', slug]
      );
      eventIds.push(res.rows[0].eventid);
    }
    const existingEvents = await client.query('SELECT eventid FROM events');
    const allEventIds = existingEvents.rows.map(r => r.eventid);

    // ---- Users (test users with known password) ----
    const userIds = [];
    const credentials = [];
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const usedUsernames = new Set();
    for (let i = 0; i < COUNT; i++) {
      const first = rand(firstNames);
      const last = rand(lastNames);
      let username = `${first}${last}${randInt(1,999)}`.toLowerCase();
      while (usedUsernames.has(username)) { username = `${first}${last}${randInt(1,9999)}`.toLowerCase(); }
      usedUsernames.add(username);
      const email = `${username}@testmail.dev`;
      const res = await client.query(
        `INSERT INTO users (username, passwordhash, email) VALUES ($1,$2,$3) RETURNING userid`,
        [username, passwordHash, email]
      );
      userIds.push(res.rows[0].userid);
      credentials.push({ username, email, password: TEST_PASSWORD });
    }
    const existingUsers = await client.query('SELECT userid FROM users');
    const allUserIds = existingUsers.rows.map(r => r.userid);

    // ---- Userfollows (unique userid+artistid pairs) ----
    const followPairs = new Set();
    let followInserted = 0;
    let guard = 0;
    while (followInserted < COUNT && guard < COUNT * 20) {
      guard++;
      const userid = rand(allUserIds);
      const artistid = rand(allArtistIds);
      const key = `${userid}-${artistid}`;
      if (followPairs.has(key)) continue;
      followPairs.add(key);
      await client.query('INSERT INTO userfollows (userid, artistid) VALUES ($1,$2)', [userid, artistid]);
      followInserted++;
    }

    // ---- Eventartists (unique eventid+artistid pairs) ----
    const eaPairs = new Set();
    let eaInserted = 0;
    guard = 0;
    while (eaInserted < COUNT && guard < COUNT * 20) {
      guard++;
      const eventid = rand(allEventIds);
      const artistid = rand(allArtistIds);
      const key = `${eventid}-${artistid}`;
      if (eaPairs.has(key)) continue;
      eaPairs.add(key);
      await client.query('INSERT INTO eventartists (eventid, artistid) VALUES ($1,$2)', [eventid, artistid]);
      eaInserted++;
    }

    // ---- Usertickets ----
    const usedPaymentIds = new Set();
    for (let i = 0; i < COUNT; i++) {
      let paymentid = `PAY${Date.now()}${randInt(1000,9999)}`;
      while (usedPaymentIds.has(paymentid)) { paymentid = `PAY${Date.now()}${randInt(1000,9999)}`; }
      usedPaymentIds.add(paymentid);
      const nooftickets = randInt(1, 5);
      const bookingTime = randDate(new Date('2025-01-01'), new Date('2026-09-20'));
      const eventid = rand(allEventIds);
      const paymentmethod = rand(paymentMethods);
      const qrcode = `QR${paymentid}`;
      const userid = rand(allUserIds);
      const ticketstatus = rand(ticketStatuses);
      const paymentstatus = rand(paymentStatuses);
      await client.query(
        `INSERT INTO usertickets (paymentid, nooftickets, booking_time, eventid, paymentmethod, qrcode, userid, ticketstatus, paymentstatus)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [paymentid, nooftickets, bookingTime, eventid, paymentmethod, qrcode, userid, ticketstatus, paymentstatus]
      );
    }

    await client.query('COMMIT');

    console.log(`Inserted ${artistIds.length} artists, ${COUNT} tracks, ${eventIds.length} events, ${userIds.length} users, ${followInserted} userfollows, ${eaInserted} eventartists, ${COUNT} usertickets.`);
    console.log('\n--- SAMPLE TEST USER LOGIN CREDENTIALS (all seeded users share this password) ---');
    console.log(`Password for ALL seeded users: ${TEST_PASSWORD}\n`);
    credentials.slice(0, 10).forEach(c => console.log(`  ${c.email}  (username: ${c.username})`));
    console.log(`  ...and ${credentials.length - 10} more (full list written to scripts/seedRandom.credentials.json)`);

    const fs = await import('fs');
    fs.writeFileSync(new URL('./seedRandom.credentials.json', import.meta.url), JSON.stringify(credentials, null, 2));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
