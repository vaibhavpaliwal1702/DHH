import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Artists from "./pages/Artists";
import Music from "./pages/Music";
import Events from "./pages/Events";
import ArtistDetail from './pages/ArtistDetail.jsx';
import EventDetail from './pages/EventDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import AskDHH from "./components/AskDHH";
import { FollowProvider } from "./context/FollowContext";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <FollowProvider>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/music" element={<Music />} />
            <Route path="/events" element={<Events />} />
            <Route path="/artists/:slug" element={<ArtistDetail />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <AskDHH />
      </FollowProvider>
    </div>
  );
}

export default App;
