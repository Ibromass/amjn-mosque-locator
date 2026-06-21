import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import MosqueCard from "../Components/MosqueCard";
import NearestAhmadiyyaBanner from "../Components/NearestAhmadiyyaBanner";
import { getUserLocation, calculateDistance } from "../Api/Location";
import { MosqueService } from "../Api/MosqueService";
import { FaMapMarkerAlt, FaList } from "react-icons/fa";

const fallbackLocation = { lat: 6.5244, lng: 3.3792 };
const mosquesPerPage = 6;

function Home() {
    const { registerSearch } = useOutletContext() || {};
    const [mosques, setMosques] = useState([]);
    const [nearByMosques, setNearByMosques] = useState([]);
    const [filteredMosques, setFilteredMosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [userLocation, setUserLocation] = useState(null);

    // Load favorites
    useEffect(() => {
        const stored = localStorage.getItem('favorites');
        if (stored) setFavorites(JSON.parse(stored));
    }, []);

    const toggleFavorite = useCallback((mosque) => {
        const isFav = favorites.some(f => f.id === mosque.id);
        const updated = isFav 
            ? favorites.filter(f => f.id !== mosque.id)
            : [...favorites, mosque];
        
        setFavorites(updated);
        localStorage.setItem('favorites', JSON.stringify(updated));
    }, [favorites]);

    const handleSearch = useCallback((query) => {
        if (!query.trim()) {
            setFilteredMosques(mosques);
            setCurrentPage(1);
            return;
        }
        const q = query.toLowerCase();
        const filtered = mosques.filter((m) =>
            m.name?.toLowerCase().includes(q) ||
            m.state?.toLowerCase().includes(q) ||
            m.region?.toLowerCase().includes(q)
        );
        setFilteredMosques(filtered);
        setCurrentPage(1);
    }, [mosques]);

    // Register search handler with Layout's shared NavBar
    useEffect(() => {
        registerSearch?.(handleSearch);
    }, [handleSearch, registerSearch]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const data = await MosqueService.getAll();
                let pos;
                try {
                    pos = await getUserLocation();
                } catch {
                    pos = { latitude: fallbackLocation.lat, longitude: fallbackLocation.lng };
                }
                const userLoc = { lat: pos.latitude, lng: pos.longitude };
                setUserLocation(userLoc);

                const enriched = data.map((m) => ({
                    ...m,
                    distance: calculateDistance(userLoc.lat, userLoc.lng, Number(m.latitude), Number(m.longitude)),
                }));

                const sorted = enriched.sort((a, b) => a.distance - b.distance);
                setMosques(sorted);
                setFilteredMosques(sorted);
                setNearByMosques(sorted.filter((m) => m.distance <= 5));
                setCurrentPage(1);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const totalPages = Math.max(1, Math.ceil(filteredMosques.length / mosquesPerPage));
    const startIndex = (currentPage - 1) * mosquesPerPage;
    const paginatedMosques = filteredMosques.slice(startIndex, startIndex + mosquesPerPage);
    const pageStart = filteredMosques.length === 0 ? 0 : startIndex + 1;
    const pageEnd = Math.min(startIndex + mosquesPerPage, filteredMosques.length);

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
                <p>Finding mosques near you...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Nearest Ahmadiyya Mosque Suggestion */}
            <NearestAhmadiyyaBanner
                userLocation={userLocation}
                mosques={mosques}
            />

            {/* Nearby Section */}
            {nearByMosques.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                    <h2 className="section-title">
                        <FaMapMarkerAlt /> Nearby Mosques
                    </h2>
                    <div className="mosque-grid">
                        {nearByMosques.map((item) => (
                            <MosqueCard 
                                key={item.id} 
                                mosque={item} 
                                isFavorite={favorites.some(f => f.id === item.id)}
                                onToggleFavorite={() => toggleFavorite(item)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* All Mosques */}
            <section>
                <h2 className="section-title">
                    <FaList /> All Mosques
                    <span style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: 400,
                        marginLeft: 'auto'
                    }}>
                        Sorted by distance
                    </span>
                </h2>
                
                {filteredMosques.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No mosques found</h3>
                        <p>Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="mosque-grid">
                            {paginatedMosques.map((item) => (
                                <MosqueCard 
                                    key={item.id} 
                                    mosque={item} 
                                    isFavorite={favorites.some(f => f.id === item.id)}
                                    onToggleFavorite={() => toggleFavorite(item)}
                                />
                            ))}
                        </div>

                        <div className="pagination-bar">
                            <span>
                                Showing {pageStart}-{pageEnd} of {filteredMosques.length}
                            </span>
                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                >
                                    Previous
                                </button>
                                <span className="page-count">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default Home;
