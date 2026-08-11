import "../styles/Home.css";
import ArtistCard from "../components/ArtistCard";
import useFetch from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

function getSeedFromHour(hourString) {
    let hash = 0;
    for (let i = 0; i < hourString.length; i++) {
        hash = (hash << 5) - hash + hourString.charCodeAt(i);
        hash |= 0;
    }
    return hash >>> 0;
}

function getRandomFeaturedArtists(artists) {
    const currentHour = new Date().toISOString().slice(0, 13);
    const seed = getSeedFromHour(currentHour);
    const random = (() => {
        let value = seed || 1;
        return () => {
            value = (value * 1664525 + 1013904223) % 4294967296;
            return value / 4294967296;
        };
    })();

    const shuffled = [...artists];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
}

function Home() {
    const { data: artistData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/artists`);

    const featuredArtists = useMemo(
        () => getRandomFeaturedArtists(artistData || []),
        [artistData]
    );

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <div>
            <div className="hero">
                <h1 className="hero-title">From the streets. For the culture.</h1>
                <p className="hero-description">These artists started with nothing and became the voice of a generation. Explore their stories, their music, and where they're going next.</p>
            </div>

            <div className="featured-artists">
                <div className="featured-header">
                    <h2>Featured Artists</h2>
                    <Link to="/artists" className="see-more-button">See more →</Link>
                </div>
            </div>
            <div className="features">
                {featuredArtists.length === 0 ? (
                    <p>No Artist Available at the moment.</p>
                ) : (
                    featuredArtists.map((art) => (
                        <ArtistCard
                            key={art.artistid}
                            artistImg={art.image}
                            artistName={art.name}
                            slug={art.slug}
                            artistId={art.artistid}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Home;
