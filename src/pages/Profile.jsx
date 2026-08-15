import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import ArtistCard from '../components/ArtistCard';
import '../styles/Profile.css';

function Profile() {
    const { user } = useAuth();
    const [followedArtists, setFollowedArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/follows`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setFollowedArtists(data);
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return <p>Please log in to view your profile.</p>;
    if (loading) return <p>Loading...</p>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.username[0].toUpperCase()}
                </div>
                <h1 className="profile-username">{user.username}</h1>
            </div>

            <div className="profile-section">
                <h2>Followed Artists</h2>
                {followedArtists.length === 0 ? (
                    <p>You haven't followed any artists yet.</p>
                ) : (
                    <div className="profile-artist-grid">
                        {followedArtists.map(artist => (
                            <ArtistCard
                                key={artist.artistid}
                                artistImg={artist.image}
                                artistName={artist.name}
                                slug={artist.slug}
                                artistId={artist.artistid}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;