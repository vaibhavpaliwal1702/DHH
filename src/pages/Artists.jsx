import ArtistCard from "../components/ArtistCard";
import '../styles/Artists.css';
import useFetch from '../hooks/useFetch';
import { useState } from 'react';

function Artists() {

    const [searchTerm, setSearchTerm] = useState('');
    const { data: artists, loading, error } = useFetch('http://localhost:3001/artists');
    
    
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    
    const filteredArtists = artists.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="artists">
                <h2>Artists</h2>
            </div>
            <input type="text" placeholder="Search artists..." className="search-bar" onChange={(e) => setSearchTerm(e.target.value)} />
            {filteredArtists.length > 0 ? (
                <div className='Art-features'>
                    {filteredArtists.map((artist) => (
                        <ArtistCard
                            key={artist.id}
                            artistImg={artist.image}
                            artistName={artist.name}
                            slug={artist.slug}
                        />
                    ))
                    }
                </div>
            ) : (
                <p>No artists found.</p>
            )}
        </div>
    )
}

export default Artists
