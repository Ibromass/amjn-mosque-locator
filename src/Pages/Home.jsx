import { useEffect, useState } from "react";
import MosqueCard from "../Components/MosqueCard";

import { getUserLocation, calculateDistance } from "../Api/Location";
import { MosqueService } from "../Api/MosqueService";

function Home() {
  const [mosques, setMosques] = useState([]);
  const [nearByMosques, setNearByMosques] = useState([]);
  const [filteredMosques, setFilteredMosques] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ ADD: Favorites state
  const [favorites, setFavorites] = useState([]);

  // ✅ ADD: Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // ✅ ADD: Toggle favorite function
  const toggleFavorite = (mosque) => {
    const isFav = favorites.some(f => f.id === mosque.id);
    let updated;
    
    if (isFav) {
      updated = favorites.filter(f => f.id !== mosque.id);
    } else {
      updated = [...favorites, mosque];
    }
    
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await MosqueService.getAll();

        const pos = await getUserLocation();

        const userLoc = {
          lat: pos.latitude,
          lng: pos.longitude,
        };

        setUserLocation(userLoc);

        const enriched = data.map((m) => ({
          ...m,
          distance: calculateDistance(
            userLoc.lat,
            userLoc.lng,
            m.latitude,
            m.longitude
          ),
        }));

        const sorted = enriched.sort((a, b) => a.distance - b.distance);

        setMosques(sorted);
        setFilteredMosques(sorted);

        const nearby = sorted.filter((m) => m.distance <= 5);
        setNearByMosques(nearby);

      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredMosques(mosques);
      return;
    }

    const q = query.toLowerCase();

    const filtered = mosques.filter((m) => {
      return (
        m.name?.toLowerCase().includes(q) ||
        m.state?.toLowerCase().includes(q) ||
        m.region?.toLowerCase().includes(q)
      );
    });

    setFilteredMosques(filtered);
  };

  return (
    <div>

      {/* ✅ NEARBY */}
      {nearByMosques.length > 0 && (
        <>
          <h1>Nearby Mosques</h1>
          <div className="mosque-grid">
            {nearByMosques.map((item) => (
              <MosqueCard 
                key={item.id} 
                mosque={item} 
                // ✅ ADD: Pass favorite props
                isFavorite={favorites.some(f => f.id === item.id)}
                onToggleFavorite={() => toggleFavorite(item)}
                
              />
            ))}
          </div>
        </>
      )}

      <br />
      <br>
      </br>
      <br>
      </br>
      <br>
      </br>

      {/* ✅ FILTERED MOSQUES */}
      <h1>All Mosques(Sort By Distance )</h1>

      <div className="mosque-grid">
        {filteredMosques.map((item) => (
          <MosqueCard 
            key={item.id} 
            mosque={item} 
            // ✅ ADD: Pass favorite props
            isFavorite={favorites.some(f => f.id === item.id)}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        ))}
      </div>

    </div>
  );
}

export default Home;