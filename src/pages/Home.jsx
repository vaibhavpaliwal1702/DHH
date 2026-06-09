import "../styles/Home.css";
import ArtistCard from "../components/ArtistCard";
import { useState, useEffect } from "react";

function Home({ toggleFollow, followedArtist }) {

    const [artistData, setArtistData] = useState("");
    useEffect(() => {
        fetch('http://localhost:3001/artists')
            .then(response => response.json())
            .then(data => setArtistData(data));
    }, []);


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
                        toggleFollow={toggleFollow}
                        isFollowed={followedArtist.includes(art.slug)}
                    />
                )))}
            </div>
        </div>
    );
}

export default Home;
