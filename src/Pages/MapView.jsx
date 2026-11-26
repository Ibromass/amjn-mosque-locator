import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    InfoWindow,
    DirectionsRenderer,
} from "@react-google-maps/api";
import MosqueMapSearch from "../Components/MosqueMapSearch";
import { useCallback, useEffect, useRef, useState } from "react";
import { MosqueService } from "../Api/MosqueService";
import { addDistanceToMosques } from "../Api/DistanceHelper";
import { FaDirections, FaMapMarkedAlt, FaTimes, FaMosque, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { calculateDistance, getUserLocation, hasValidCoordinates } from "../Api/Location";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const LIBRARIES = ["places"];

const GOLD_MARKER = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
const AHMADIYYA_SEARCH_TERMS = [
    "Ahmadiyya mosque",
    "Ahmadiyya Muslim Jamaat mosque",
];

const searchNearbyPages = (service, request) => new Promise((resolve) => {
    const results = [];
    let pagesFetched = 0;

    const onResults = (pageResults, status, pagination) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && pageResults) {
            results.push(...pageResults);
            pagesFetched += 1;
            if (pagination?.hasNextPage && pagesFetched < 3) {
                window.setTimeout(() => pagination.nextPage(), 2000);
                return;
            }
        }

        resolve({ results, status });
    };

    service.nearbySearch(request, onResults);
});

const getNearbyMosques = (mosques, radiusKm = 10) => {
    return mosques.filter((m) => Number.isFinite(m.distanceKm) && m.distanceKm <= radiusKm);
};

function MapView({ setMosques }) {
    const [userLocation, setUserLocation] = useState(null);
    const [mosques, localSetMosques] = useState([]);
    const [selected, setSelected] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState(null);
    const [ahmadiyyaPlaces, setAhmadiyyaPlaces] = useState([]);
    const [nearestAhmadiyya, setNearestAhmadiyya] = useState(null);
    const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
    const [placesSearchMessage, setPlacesSearchMessage] = useState("");

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

                let userLoc;
                try {
                    const position = await getUserLocation();
                    userLoc = { lat: position.latitude, lng: position.longitude };
                } catch {
                    userLoc = { lat: 6.5244, lng: 3.3792 };
                }
                setUserLocation(userLoc);
                const enriched = addDistanceToMosques(data, userLoc).sort(
                    (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
                );
                localSetMosques(enriched);
                setMosques?.(enriched);
                setLoading(false);
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
            (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
        );
        localSetMosques(enriched);
        setMosques?.(enriched);
    }, [userLocation]);

    // Auto fit map to show user + nearby mosques
    useEffect(() => {
        if (!map || !userLocation || mosques.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(userLocation);

        const nearby = getNearbyMosques(mosques).filter((m) =>
            hasValidCoordinates(m.latitude, m.longitude)
        );
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

    const searchAhmadiyyaPlaces = useCallback(async (center, radius, searchTerms = AHMADIYYA_SEARCH_TERMS) => {
        if (!map || !center || !window.google?.maps?.places) return;

        setIsSearchingPlaces(true);
        setPlacesSearchMessage("Searching Google Maps for Ahmadiyya mosques…");

        try {
            const service = new window.google.maps.places.PlacesService(map);
            const found = [];

            for (const term of searchTerms) {
                const response = await searchNearbyPages(service, {
                    location: new window.google.maps.LatLng(center.lat, center.lng),
                    radius: Math.min(50000, Math.max(1000, radius)),
                    type: "mosque",
                    keyword: term,
                });

                if (
                    response.status !== window.google.maps.places.PlacesServiceStatus.OK &&
                    response.status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
                ) {
                    throw new Error(`Google Places search failed: ${response.status}`);
                }
                found.push(...response.results);
            }

            const unique = new Map();
            found
                .filter((place) => place.place_id && place.geometry?.location)
                .forEach((place) => {
                    if (unique.has(place.place_id)) return;
                    unique.set(place.place_id, {
                        id: place.place_id,
                        name: place.name,
                        address: place.vicinity || place.formatted_address || "",
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng(),
                        placeId: place.place_id,
                        rating: place.rating,
                    });
                });

            const places = [...unique.values()].map((place) => ({
                ...place,
                dist: userLocation
                    ? calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          place.latitude,
                          place.longitude
                      )
                    : null,
            }));
            setAhmadiyyaPlaces(places);

            const sorted = [...places].sort((a, b) => a.dist - b.dist);
            setNearestAhmadiyya(sorted[0] || null);
            setPlacesSearchMessage(
                places.length
                    ? `Showing ${places.length} Google Maps Ahmadiyya mosque listings in this area.`
                    : "No Ahmadiyya mosque listings were found in this area."
            );
        } catch (error) {
            console.error("Google Places mosque search failed:", error);
            setPlacesSearchMessage("Google Maps search is unavailable. Check the Places API settings for this map key.");
        } finally {
            setIsSearchingPlaces(false);
        }
    }, [map, userLocation]);

    const searchCurrentMapArea = useCallback(() => {
        if (!map) return;
        const bounds = map.getBounds();
        const center = map.getCenter();
        if (!bounds || !center) {
            setPlacesSearchMessage("Wait for the map to finish loading, then search this area.");
            return;
        }

        const northEast = bounds.getNorthEast();
        const radius = calculateDistance(
            center.lat(),
            center.lng(),
            northEast.lat(),
            northEast.lng()
        ) * 1000;
        if (!Number.isFinite(radius)) {
            setPlacesSearchMessage("Could not read this map area. Try moving or zooming the map, then search again.");
            return;
        }
        searchAhmadiyyaPlaces(
            { lat: center.lat(), lng: center.lng() },
            radius
        );
    }, [map, searchAhmadiyyaPlaces]);

    // Search Google Places for Ahmadiyya mosques once the map + user location are ready
    useEffect(() => {
        if (!map || !userLocation || ahmadiyyaSearchedRef.current) return;
        ahmadiyyaSearchedRef.current = true;
        searchAhmadiyyaPlaces(userLocation, 20000, [AHMADIYYA_SEARCH_TERMS[0]]);
    }, [map, userLocation, searchAhmadiyyaPlaces]);

    const onLoad = (mapInstance) => setMap(mapInstance);

    const handleMosqueSelect = (result) => {
        if (!hasValidCoordinates(result.latitude, result.longitude)) return;
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

                        <div className="map-area-search-controls">
                            <button
                                type="button"
                                className="map-area-search-button"
                                onClick={searchCurrentMapArea}
                                disabled={isSearchingPlaces}
                            >
                                <FaSearch />
                                {isSearchingPlaces ? "Searching…" : "Find Ahmadiyya Mosques Here"}
                            </button>
                            {placesSearchMessage && (
                                <span className="map-area-search-message" role="status">
                                    {placesSearchMessage}
                                </span>
                            )}
                        </div>

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
                            {mosques.filter((m) =>
                                hasValidCoordinates(m.latitude, m.longitude)
                            ).map((m, i) => (
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
                                            {selected.distanceKm != null && Number.isFinite(Number(selected.distanceKm))
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


