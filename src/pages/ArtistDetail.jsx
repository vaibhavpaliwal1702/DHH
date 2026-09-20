import '../styles/ArtistDetail.css'
import { useParams, useNavigate } from 'react-router-dom'
import useFetch from '../hooks/useFetch';
import ArtistImage from '../components/ArtistImage';
import '../styles/Skeleton.css';

function ArtistDetail() {

    const navigate = useNavigate();


    const { slug } = useParams();

    const { data: artistData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/artists?slug=${slug}`)


    if (error) return <p>Error: {error}</p>

    const artist = artistData[0];

    if (!loading && !artist) return <p>Artist not found</p>
    return (
        <div>
            <button onClick={() => navigate(-1)} className="back_link">
                ← Back
            </button>
            {loading ? (
                <div className="ArtistDetailDesign" aria-busy="true" aria-label="Loading artist">
                    <div className="skeleton artist-detail-skeleton-image" />
                    <div className="artist-detail-skeleton-info">
                        <div className="skeleton artist-detail-skeleton-title" />
                        <div className="skeleton artist-detail-skeleton-line" />
                        <div className="skeleton artist-detail-skeleton-line" />
                        <div className="skeleton artist-detail-skeleton-line" style={{ width: '70%' }} />
                    </div>
                </div>
            ) : (
                <div className="ArtistDetailDesign">
                    <ArtistImage src={artist.image} name={artist.name} className='artist_image' />
                    <div className="artist_info">
                        <p className='artist_name'>{artist.name}</p>
                        <p className="artist_bio">{artist.description}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArtistDetail
