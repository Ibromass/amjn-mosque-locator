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
import { FaDirections, FaMapMarkedAlt, FaTimes } from "react-icons/fa";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];
const autocompleteOptions = {
    componentRestrictions: { country: "ng" },
    fields: ["geometry", "formatted_address", "name"],
};

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
    const [searchedLocation, setSearchedLocation] = useState(null);

    const searchRef = useRef(null);
    const rawMosquesRef = useRef([]);

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

    const onLoad = (mapInstance) => setMap(mapInstance);

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

            {loading ? (
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

                    <LoadScript
                        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                        libraries={libraries}
                    >
                        <Autocomplete
                            options={autocompleteOptions}
                            onLoad={(ref) => (searchRef.current = ref)}
                            onPlaceChanged={() => {
                                const place = searchRef.current.getPlace();
                                if (!place.geometry) return;
                                const newLoc = {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                };
                                setSearchedLocation(newLoc);
                                map?.panTo(newLoc);
                                map?.setZoom(14);
                            }}
                        >
                            <input
                                className="map-search-input"
                                placeholder="Search location..."
                            />
                        </Autocomplete>

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

                            {searchedLocation && (
                                <Marker
                                    key={`search-${searchedLocation.lat}-${searchedLocation.lng}`}
                                    position={searchedLocation}
                                    icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                    zIndex={998}
                                    label={{
                                        text: "Search",
                                        color: "#ffffff",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                    }}
                                />
                            )}

                            {/* Mosque markers */}
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
                                            Lat: {selected.latitude}, Lng:{" "}
                                            {selected.longitude}
                                        </p>
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
                    </LoadScript>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;


