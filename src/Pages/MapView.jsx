import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    Autocomplete,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { MosqueService } from "../Api/MosqueService";
import { FaDirections } from "react-icons/fa";

const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "500px",
};

const libraries = ["places"];

const addDistanceToMosques = (mosques, userLoc) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const calcKm = (aLat, aLng, bLat, bLng) => {
        const R = 6371;
        const dLat = toRad(bLat - aLat);
        const dLng = toRad(bLng - aLng);
        const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
        return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
    };

    return mosques.map((m) => ({
        ...m,
        distanceKm: calcKm(userLoc.lat, userLoc.lng, m.latitude, m.longitude).toFixed(2),
    }));
};

function MapView({ setMosques }) {
    const [userLocation, setUserLocation] = useState(null);
    const [mosques, localSetMosques] = useState([]);
    const [selected, setSelected] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);

    const searchRef = useRef(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setUserLocation({ lat: 6.5244, lng: 3.3792 })
        );
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await MosqueService.getAll();
                navigator.geolocation.getCurrentPosition((pos) => {
                    const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(userLoc);
                    const enriched = addDistanceToMosques(data, userLoc);
                    localSetMosques(enriched);
                    setMosques?.(enriched);
                    setLoading(false);
                }, () => {
                    setLoading(false);
                });
            } catch (err) {
                console.error("Failed loading mosques:", err);
                setLoading(false);
            }
        };
        load();
    }, []);

    const onLoad = (mapInstance) => setMap(mapInstance);

    const openDirections = (mosque) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`,
            "_blank"
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1>🗺️ Map View</h1>
                <p>Explore mosques on the interactive map</p>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
                    <p>Loading map data...</p>
                </div>
            ) : (
                <div className="map-container" style={{ height: '70vh', minHeight: '400px' }}>
                    <LoadScript
                        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                        libraries={libraries}
                    >
                        <Autocomplete
                            onLoad={(ref) => (searchRef.current = ref)}
                            onPlaceChanged={() => {
                                const place = searchRef.current.getPlace();
                                if (!place.geometry) return;
                                const newLoc = {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                };
                                setUserLocation(newLoc);
                                map?.panTo(newLoc);
                                map?.setZoom(14);
                            }}
                        >
                            <div className="map-search-box">
                                <input placeholder="Search location..." />
                            </div>
                        </Autocomplete>

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={userLocation || { lat: 6.5244, lng: 3.3792 }}
                            zoom={13}
                            onLoad={onLoad}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
                                ],
                                mapTypeControl: false,
                                fullscreenControl: true,
                                streetViewControl: false,
                            }}
                        >
                            {userLocation && (
                                <Marker
                                    position={userLocation}
                                    icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                />
                            )}

                            {mosques.map((m, i) => (
                                <Marker
                                    key={i}
                                    position={{ lat: m.latitude, lng: m.longitude }}
                                    icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                    onClick={() => setSelected(m)}
                                />
                            ))}

                            {selected && (
                                <InfoWindow
                                    position={{ lat: selected.latitude, lng: selected.longitude }}
                                    onCloseClick={() => setSelected(null)}
                                >
                                    <div style={{ padding: '8px', minWidth: '200px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#059669' }}>
                                            {selected.name}
                                        </h4>
                                        <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                                            {selected.distanceKm} km away
                                        </p>
                                        <button 
                                            onClick={() => openDirections(selected)}
                                            style={{
                                                background: '#10b981',
                                                color: '#0f172a',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}
                                        >
                                            <FaDirections style={{ marginRight: '6px' }} />
                                            Directions
                                        </button>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </LoadScript>
                </div>
            )}
        </div>
    );
}

export default MapView;