import '../styles/ArtistDetail.css'
import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch';

function ArtistDetail() {

    

    const { slug } = useParams();

    const { data: artistData, loading, error } = useFetch(`http://localhost:3001/artists?slug=${slug}`)

    
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    
    const artist = artistData[0];

    if (!artist) return <p>Artist not found</p>
    return (
        <div className="ArtistDetailDesign">
            <img src={artist.image} alt={artist.name} className='artist_image' />
            <p className='artist_name'>{artist.name}</p>
        </div>
    )
}

export default ArtistDetail
