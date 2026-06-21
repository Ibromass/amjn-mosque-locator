import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    InfoWindow,
    DirectionsRenderer,
} from "@react-google-maps/api";
import MosqueMapSearch from "../Components/MosqueMapSearch";
import { useEffect, useRef, useState } from "react";
import { MosqueService } from "../Api/MosqueService";
import { addDistanceToMosques } from "../Api/DistanceHelper";
import { FaDirections, FaMapMarkedAlt, FaTimes, FaMosque, FaMapMarkerAlt } from "react-icons/fa";
import { calculateDistance } from "../Api/Location";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const LIBRARIES = ["places"];

const GOLD_MARKER = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";

const getNearbyMosques = (mosques, radiusKm = 10) => {
    return mosques.filter((m) => parseFloat(m.distanceKm) <= radiusKm);
};

const hasValidCoordinates = (mosque) =>
    Number.isFinite(Number(mosque.latitude)) &&
    Number.isFinite(Number(mosque.longitude));

function MapView({ setMosques }) {
    const [userLocation, setUserLocation] = useState(null);
    const [mosques, localSetMosques] = useState([]);
    const [selected, setSelected] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState(null);
    const [ahmadiyyaPlaces, setAhmadiyyaPlaces] = useState([]);
    const [nearestAhmadiyya, setNearestAhmadiyya] = useState(null);

    const rawMosquesRef = useRef([]);
    const ahmadiyyaSearchedRef = useRef(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
        libraries: LIBRARIES,
    });

    // Initial load - fetch mosques and get user location once
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

    // Recalculate distances every time userLocation changes
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

        const nearby = getNearbyMosques(mosques).filter(hasValidCoordinates);
        nearby.forEach((m) =>
            bounds.extend({ lat: Number(m.latitude), lng: Number(m.longitude) })
        );

        if (nearby.length === 0) {
            map.panTo(userLocation);
            map.setZoom(14);
        } else {
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [map, userLocation, mosques]);

    // Search Google Places for Ahmadiyya mosques once the map + user location are ready
    useEffect(() => {
        if (!map || !userLocation || ahmadiyyaSearchedRef.current) return;
        ahmadiyyaSearchedRef.current = true;

        const service = new window.google.maps.places.PlacesService(map);
        service.nearbySearch(
            {
                location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                radius: 20000,
                keyword: "Ahmadiyya mosque",
            },
            (results, status) => {
                if (
                    status !== window.google.maps.places.PlacesServiceStatus.OK ||
                    !results?.length
                ) return;

                const places = results
                    .filter((r) => r.geometry?.location)
                    .map((r) => ({
                        id: r.place_id,
                        name: r.name,
                        address: r.vicinity,
                        latitude: r.geometry.location.lat(),
                        longitude: r.geometry.location.lng(),
                        placeId: r.place_id,
                        rating: r.rating,
                    }));

                setAhmadiyyaPlaces(places);

                // Find the nearest for the map info badge
                const sorted = places
                    .map((p) => ({
                        ...p,
                        dist: calculateDistance(
                            userLocation.lat, userLocation.lng,
                            p.latitude, p.longitude
                        ),
                    }))
                    .sort((a, b) => a.dist - b.dist);
                if (sorted.length > 0) setNearestAhmadiyya(sorted[0]);
            }
        );
    }, [map, userLocation]);

    const onLoad = (mapInstance) => setMap(mapInstance);

    const handleMosqueSelect = (result) => {
        if (!result.latitude || !result.longitude) return;
        const pos = { lat: result.latitude, lng: result.longitude };
        map?.panTo(pos);
        map?.setZoom(16);
        // Open the info window for this mosque
        setSelected({
            name: result.name,
            latitude: result.latitude,
            longitude: result.longitude,
            distanceKm: result.dist?.toFixed(2),
            address: result.subtitle,
            id: result.source === "database" ? result.id : null,
        });
        setDirections(null);
    };

    const showDirectionsOnMap = (mosque) => {
        if (!userLocation || !window.google) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: userLocation,
                destination: { lat: Number(mosque.latitude), lng: Number(mosque.longitude) },
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
                <h1><FaMapMarkedAlt /> Map View</h1>
                <p>Explore mosques on the interactive map</p>
            </div>

            {loading || !isLoaded ? (
                <div className="empty-state">
                    <div
                        className="loading-spinner"
                        style={{ margin: "0 auto 20px" }}
                    />
                    <p>Loading map data...</p>
                </div>
            ) : (
                <div className="map-panel">
                    <div className="map-panel-header">
                        <span>Location Preview</span>
                        <small>Search, select a marker, or get directions</small>
                    </div>

                    {/* Nearest Ahmadiyya badge */}
                    {nearestAhmadiyya && (
                        <div className="map-ahmadiyya-badge">
                            <FaMosque />
                            <span>
                                <strong>Nearest Ahmadiyya:</strong>{" "}
                                {nearestAhmadiyya.name}
                                {nearestAhmadiyya.dist != null && (
                                    <> — {nearestAhmadiyya.dist.toFixed(1)} km</>
                                )}
                            </span>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestAhmadiyya.latitude},${nearestAhmadiyya.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-ahmadiyya-badge-link"
                            >
                                <FaDirections /> Directions
                            </a>
                        </div>
                    )}

                    <div className="map-container">
                    {/* Clear Route button */}
                    {directions && (
                        <button
                            className="map-clear-route"
                            onClick={() => setDirections(null)}
                        >
                            <FaTimes /> Clear Route
                        </button>
                    )}

                        <MosqueMapSearch
                            mosques={mosques}
                            userLocation={userLocation}
                            onSelect={handleMosqueSelect}
                        />

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={userLocation || { lat: 6.5244, lng: 3.3792 }}
                            zoom={13}
                            onLoad={onLoad}
                            options={{
                                mapTypeControl: false,
                                fullscreenControl: true,
                                streetViewControl: true,
                            }}
                        >
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

                            {/* AMJN database mosque markers (green) */}
                            {mosques.filter(hasValidCoordinates).map((m, i) => (
                                <Marker
                                    key={m.id || `${m.latitude}-${m.longitude}-${i}`}
                                    position={{
                                        lat: Number(m.latitude),
                                        lng: Number(m.longitude),
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

                            {/* Ahmadiyya mosques from Google Places (gold markers) */}
                            {ahmadiyyaPlaces.map((p) => (
                                <Marker
                                    key={`ahmadiyya-${p.id}`}
                                    position={{ lat: p.latitude, lng: p.longitude }}
                                    icon={GOLD_MARKER}
                                    zIndex={997}
                                    label={{
                                        text: p.name,
                                        color: "#78350f",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                    }}
                                    onClick={() => {
                                        setSelected({
                                            ...p,
                                            distanceKm: p.dist?.toFixed(2),
                                            address: p.address,
                                        });
                                        setDirections(null);
                                    }}
                                />
                            ))}

                            {selected && (
                                <InfoWindow
                                    position={{
                                        lat: Number(selected.latitude),
                                        lng: Number(selected.longitude),
                                    }}
                                    onCloseClick={() => setSelected(null)}
                                >
                                    <div className="map-info-window">
                                        <h4>
                                            {selected.name}
                                        </h4>
                                        <p>
                                            {selected.distanceKm
                                                ? `${selected.distanceKm} km away`
                                                : selected.address || ""}
                                        </p>
                                        <button
                                            className="map-directions-button"
                                            onClick={() =>
                                                showDirectionsOnMap(selected)
                                            }
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;


