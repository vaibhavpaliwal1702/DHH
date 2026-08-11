INSERT INTO artists (artistid, name, description, image, slug) VALUES
(1, 'Krsna', 'Born in Kashmir and raised in London, Krsna built his adult life and career in Delhi. Known as a lyrical genius in the DHH scene, his command over both English and Hindi makes him one of the most versatile MCs in the game. His sharp wordplay and dense rhyme schemes have earned him a reputation as one of the finest technical rappers India has ever produced.', '/artists/Krsna.jpg', 'krsna'),
(2, 'Seedhe Maut', 'Seedhe Maut is a Delhi-based hip hop duo consisting of Encore ABJ (Abhijay Negi, roots in Uttarakhand) and Calm (Siddhant Sharma, from Nainital). The two met at SpitDope Delhi and built one of the most beloved acts in Desi Hip Hop. Their discography — Bayaan, Naayab, the 30-song mixtape Lunch Break — has been an unbroken run of bangers. They now run their own label, DL91.', '/artists/SM.jpg', 'seedhemaut'),
(3, 'Naam Sujal', 'Born and raised in Nagpur, Naam Sujal is a 19-year-old forcing the DHH scene to pay attention. Runner-up on Hustle Season 4, he followed that spotlight with Mamafication — a project packed with standout tracks that proved his placement in the scene is no accident. One of the youngest and hungriest voices in the game right now.', '/artists/NaamSujal.jpg', 'naamsujal'),
(4, 'Raftaar', 'Born Dilin Nair, Raftaar is one of the most versatile names in Indian hip-hop - rapper, producer, dancer, and TV personality with releases spanning Hindi, Punjabi, and Haryanvi music. One of the early figures who brought Desi hip-hop into mainstream visibility.', '/artists/Raftaar.jpg', 'raftaar'),
(5, 'Arpit Bala', 'Arpit Bala (also known as Arpit Balabantaray) is an Odia-background rapper, streamer, and YouTube creator who crossed over into music as part of the rap duo Foosie Gang. Known for blending comedy and hip-hop, he built a significant following through YouTube and Instagram.', '/artists/ArpitBala.jpg', 'arpit-bala'),
(6, 'Chaar Diwari', 'Chaar Diwari is the alias of 22-year-old Garv Taneja - producer, singer, songwriter, and visual artist in the Desi hip-hop community. Known for experimental Hindi music and projects like the EP Teri Maiyat Ke Gaane, he also directs and curates his own music videos.', '/artists/ChaarDiwari.jpg', 'chaar-diwari');
SELECT setval('artists_artistid_seq', 6);

INSERT INTO tracks (trackid, name, release_date, description, coverimage, artistid, slug, type) VALUES
(1, 'Boom Shaka', '2026-01-01', NULL, '/MusicCover/placeHolder.jpg', 1, 'BoomShaka', 'Single'),
(2, 'Tour Shit', '2024-01-01', NULL, '/MusicCover/placeHolder.jpg', 2, 'TourShit', 'Single'),
(3, 'Mamafication', '2026-01-01', NULL, '/MusicCover/placeHolder.jpg', 3, 'mamafication', 'Album');
SELECT setval('tracks_trackid_seq', 3);

INSERT INTO events (eventid, name, description, venue, city, country, eventdate, paymenturl, image, slug) VALUES
(1, 'Desi Hip Hop Delhi Rap Carnival', NULL, 'NDMC Convention Centre', 'Delhi', 'India', '2026-08-14', NULL, '/EventCover/placeHolder.jpg', 'desi-hip-hop-delhi-rap-carnival'),
(2, 'Desi Hip Hop Delhi Beat Fest', NULL, 'Pragati Maidan', 'Delhi', 'India', '2026-09-05', NULL, '/EventCover/placeHolder.jpg', 'desi-hip-hop-delhi-beat-fest'),
(3, 'Desi Hip Hop Delhi Street Cypher', NULL, 'India Habitat Centre', 'Delhi', 'India', '2026-10-11', NULL, '/EventCover/placeHolder.jpg', 'desi-hip-hop-delhi-cypher-showcase');
SELECT setval('events_eventid_seq', 3);

INSERT INTO eventartists (eventid, artistid) VALUES
(1, 1), (1, 2), (2, 4), (3, 5), (3, 6);