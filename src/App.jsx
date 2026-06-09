import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Artists from "./pages/Artists";
import Music from "./pages/Music";
import Events from "./pages/Events";
import ArtistDetail from './pages/ArtistDetail.jsx';
import EventDetail from './pages/EventDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

function App() {

  const [followedArtist,setFollowedArtist] = useState([]);

  const toggleFollow = (slug) => {
    setFollowedArtist((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug]
    );
  };
  return (
    <div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home toggleFollow={toggleFollow} followedArtist={followedArtist}/>} />
          <Route path="/artists" element={<Artists toggleFollow={toggleFollow} followedArtist={followedArtist}/>} />
          <Route path="/music" element={<Music />} />
          <Route path="/events" element={<Events />} />
          <Route path="/artists/:slug" element={<ArtistDetail />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
