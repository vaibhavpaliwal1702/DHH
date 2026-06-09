import '../styles/ArtistCard.css'
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { FollowContext } from '../context/FollowContext';

function ArtistCard({ artistImg, artistName, slug }) {
    const { toggleFollow, followedArtist } = useContext(FollowContext);
    const isFollowed = followedArtist.includes(slug);
    const btnClass = isFollowed ? 'artist_btn btn-following' : 'artist_btn';
    return (
        <div className="artist-card">
            <Link to={`/artists/${slug}`}>
                <img src={artistImg} alt={artistName} className="artist-img" />
                <p className="artist-name">{artistName}</p>
            </Link>
            <button className={btnClass} type='button' onClick={() => toggleFollow(slug)}>{isFollowed ? "Following" : "Follow"}</button>
        </div>
    );
}

export default ArtistCard;