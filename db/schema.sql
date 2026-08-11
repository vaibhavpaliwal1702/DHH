CREATE TABLE artists (
    artistid SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    image TEXT,
    slug VARCHAR(100) UNIQUE
);

CREATE TABLE tracks (
    trackid SERIAL PRIMARY KEY,
    name VARCHAR(100),
    release_date DATE,
    description TEXT,
    coverimage TEXT,
    artistid INTEGER REFERENCES artists(artistid) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE,
    type VARCHAR(50)
);
CREATE INDEX idx_tracks_artistid ON tracks(artistid);

CREATE TABLE events (
    eventid SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    venue TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    eventdate DATE,
    paymenturl VARCHAR(100),
    image VARCHAR(100),
    slug VARCHAR(100) UNIQUE
);

CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(100),
    passwordhash VARCHAR(100),
    email VARCHAR(100) UNIQUE
);

CREATE TABLE userfollows (
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    artistid INTEGER REFERENCES artists(artistid) ON DELETE CASCADE,
    PRIMARY KEY (userid, artistid)
);
CREATE INDEX idx_userfollows_artistid ON userfollows(artistid);

CREATE TABLE eventartists (
    eventid INTEGER REFERENCES events(eventid) ON DELETE CASCADE,
    artistid INTEGER REFERENCES artists(artistid) ON DELETE CASCADE,
    PRIMARY KEY (eventid, artistid)
);
CREATE INDEX idx_eventartists_artistid ON eventartists(artistid);

CREATE TABLE usertickets (
    ticketid SERIAL PRIMARY KEY,
    paymentid VARCHAR(100) UNIQUE,
    nooftickets INTEGER,
    booking_time TIMESTAMP,
    eventid INTEGER REFERENCES events(eventid) ON DELETE CASCADE,
    paymentmethod VARCHAR(50),
    qrcode VARCHAR(64),
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    ticketstatus VARCHAR(20) DEFAULT 'pending',
    paymentstatus VARCHAR(20) DEFAULT 'pending'
);