import "../styles/Home.css";
import ArtistCard from "../components/ArtistCard";
import useFetch from '../hooks/useFetch';

function Home() {

    const { data: artistData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/artists`);


    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <div>
            <div className="hero">
                <h1 className="hero-title">From the streets. For the culture.</h1>
                <p className="hero-description">These artists started with nothing and became the voice of a generation. Explore their stories, their music, and where they're going next.</p>
            </div>

            <div className="featured-artists">
                <h2>Featured Artists</h2>
            </div>
            <div className="features">
                {artistData.length === 0 && (
                    <p>No Artist Available at the moment.</p>)}
                {artistData.length > 0 && (artistData.map((art) => (
                    <ArtistCard
                        key={art.id}
                        artistImg={art.image}
                        artistName={art.name}
                        slug={art.slug}
                    />
                )))}
            </div>
        </div>
    );
}

export default Home;
