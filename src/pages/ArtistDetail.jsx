import '../styles/ArtistDetail.css'
import { useParams, useNavigate } from 'react-router-dom'
import useFetch from '../hooks/useFetch';

function ArtistDetail() {

    const navigate = useNavigate();


    const { slug } = useParams();

    const { data: artistData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/artists?slug=${slug}`)


    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    const artist = artistData[0];

    if (!artist) return <p>Artist not found</p>
    return (
        <div>
            <button onClick={() => navigate(-1)} className="back_link">
                ← Back
            </button>
            <div className="ArtistDetailDesign">
                <img src={artist.image} alt={artist.name} className='artist_image' />
                <div className="artist_info">
                    <p className='artist_name'>{artist.name}</p>
                    <p className="artist_bio">{artist.description}</p>
                </div>
            </div>
        </div>
    )
}

export default ArtistDetail
