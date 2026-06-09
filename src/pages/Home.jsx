import "../styles/Home.css";
import ArtistCard from "../components/ArtistCard";
import useFetch from '../hooks/useFetch';


function Home() {

    const { data: artistData, loading, error } = useFetch('http://localhost:3001/artists')


    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <div>
            <div className="hero">
                <h1>Discover the World of Music with DHH</h1>
                <p>Explore the latest news, reviews, and insights on your favorite artists, albums, and concerts.</p>
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
