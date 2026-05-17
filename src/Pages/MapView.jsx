import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    Autocomplete,
    DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { MosqueService } from "../Api/MosqueService";
import { addDistanceToMosques } from "../Api/DistanceHelper";
import { FaDirections, FaTimes } from "react-icons/fa";

const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "500px",
};

const libraries = ["places"];

const getNearbyMosques = (mosques, radiusKm = 10) => {
    return mosques.filter((m) => parseFloat(m.distanceKm) <= radiusKm);
};

function MapView({ setMosques }) {
    const [userLocation, setUserLocation] = useState(null);
    const [mosques, localSetMosques] = useState([]);
    const [selected, setSelected] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState(null);

    const searchRef = useRef(null);
    const rawMosquesRef = useRef([]);

    // Initial load — fetch mosques + get user location once
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await MosqueService.getAll();
                rawMosquesRef.current = data;

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const userLoc = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                        };
                        setUserLocation(userLoc);
                        setLoading(false);
                    },
                    () => {
                        const fallback = { lat: 6.5244, lng: 3.3792 };
                        setUserLocation(fallback);
                        const enriched = addDistanceToMosques(data, fallback).sort(
                            (a, b) => a.distanceKm - b.distanceKm
                        );
                        localSetMosques(enriched);
                        setMosques?.(enriched);
                        setLoading(false);
                    }
                );
            } catch (err) {
                console.error("Failed loading mosques:", err);
                setLoading(false);
            }
        };
        load();
    }, []);

    // ✅ Recalculate distances every time userLocation changes
    useEffect(() => {
        if (!userLocation || rawMosquesRef.current.length === 0) return;

        const enriched = addDistanceToMosques(rawMosquesRef.current, userLocation).sort(
            (a, b) => a.distanceKm - b.distanceKm
        );
        localSetMosques(enriched);
        setMosques?.(enriched);
    }, [userLocation]);

    // Auto fit map to show user + nearby mosques
    useEffect(() => {
        if (!map || !userLocation || mosques.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(userLocation);

        const nearby = getNearbyMosques(mosques);
        nearby.forEach((m) =>
            bounds.extend({ lat: m.latitude, lng: m.longitude })
        );

        if (nearby.length === 0) {
            map.panTo(userLocation);
            map.setZoom(14);
        } else {
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [map, userLocation, mosques]);

    const onLoad = (mapInstance) => setMap(mapInstance);

    const showDirectionsOnMap = (mosque) => {
        if (!userLocation || !window.google) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: userLocation,
                destination: { lat: mosque.latitude, lng: mosque.longitude },
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setSelected(null);
                } else {
                    console.error("Directions request failed:", status);
                    window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`,
                        "_blank"
                    );
                }
            }
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
                    <div
                        className="loading-spinner"
                        style={{ margin: "0 auto 20px" }}
                    />
                    <p>Loading map data...</p>
                </div>
            ) : (
                <div
                    className="map-container"
                    style={{
                        height: "90vh",
                        minHeight: "500px",
                        position: "relative",
                    }}
                >
                    {/* Clear Route button */}
                    {directions && (
                        <button
                            onClick={() => setDirections(null)}
                            style={{
                                position: "absolute",
                                top: 12,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 10,
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                        >
                            <FaTimes /> Clear Route
                        </button>
                    )}

                    <LoadScript
                        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                        libraries={libraries}
                    >
                        {/* ✅ Input is direct child of Autocomplete, properly sized */}
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
                            <input
                                placeholder="Search location..."
                                style={{
                                    position: "absolute",
                                    top: "12px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 10,
                                    width: "400px",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontSize: "14px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                    outline: "none",
                                    background: "#fff",
                                    color: "#0f172a",
                                }}
                            />
                        </Autocomplete>

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={userLocation || { lat: 6.5244, lng: 3.3792 }}
                            zoom={13}
                            onLoad={onLoad}
                            options={{
                                styles: [
                                    {
                                        elementType: "geometry",
                                        stylers: [{ color: "#1e293b" }],
                                    },
                                    {
                                        elementType: "labels.text.stroke",
                                        stylers: [{ color: "#1e293b" }],
                                    },
                                    {
                                        elementType: "labels.text.fill",
                                        stylers: [{ color: "#94a3b8" }],
                                    },
                                ],
                                mapTypeControl: false,
                                fullscreenControl: true,
                                streetViewControl: true,
                            }}
                        >
                            {/* ✅ key prop forces marker to re-render when location changes */}
                            {userLocation && (
                                <Marker
                                    key={`user-${userLocation.lat}-${userLocation.lng}`}
                                    position={userLocation}
                                    icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                    zIndex={999}
                                    label={{
                                        text: "You",
                                        color: "#ffffff",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                    }}
                                />
                            )}

                            {/* Mosque markers */}
                            {mosques.map((m, i) => (
                                <Marker
                                    key={i}
                                    position={{
                                        lat: m.latitude,
                                        lng: m.longitude,
                                    }}
                                    icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                    label={{
                                        text: m.name,
                                        color: "#ffffff",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        className: "marker-label",
                                    }}
                                    onClick={() => {
                                        setSelected(m);
                                        setDirections(null);
                                    }}
                                />
                            ))}

                            {selected && (
                                <InfoWindow
                                    position={{
                                        lat: selected.latitude,
                                        lng: selected.longitude,
                                    }}
                                    onCloseClick={() => setSelected(null)}
                                >
                                    <div
                                        style={{
                                            padding: "8px",
                                            minWidth: "200px",
                                        }}
                                    >
                                        <h4
                                            style={{
                                                marginBottom: "8px",
                                                color: "#059669",
                                            }}
                                        >
                                            {selected.name}
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                marginBottom: "4px",
                                                color: "#64748b",
                                            }}
                                        >
                                            📍 Lat: {selected.latitude}, Lng:{" "}
                                            {selected.longitude}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                marginBottom: "12px",
                                            }}
                                        >
                                            {selected.distanceKm
                                                ? `${selected.distanceKm} km away`
                                                : selected.address || ""}
                                        </p>
                                        <button
                                            onClick={() =>
                                                showDirectionsOnMap(selected)
                                            }
                                            style={{
                                                background: "#10b981",
                                                color: "#0f172a",
                                                border: "none",
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <FaDirections />
                                            Directions
                                        </button>
                                    </div>
                                </InfoWindow>
                            )}

                            {directions && (
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: true,
                                        polylineOptions: {
                                            strokeColor: "#10b981",
                                            strokeWeight: 5,
                                            strokeOpacity: 0.8,
                                        },
                                    }}
                                />
                            )}
                        </GoogleMap>
                    </LoadScript>
                </div>
            )}
        </div>
    );
}

export default MapView;