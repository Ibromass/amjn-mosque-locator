import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaDirections, FaMosque } from "react-icons/fa";
import { calculateDistance } from "../Api/Location";

/**
 * Finds the nearest Ahmadiyya mosque:
 * 1. Searches the AMJN database (all entries are Ahmadiyya mosques)
 * 2. If window.google is available, also searches Google Places for any
 *    Ahmadiyya mosques not in the database — uses whichever is closer.
 */
function NearestAhmadiyyaBanner({ userLocation, mosques }) {
    const [nearest, setNearest] = useState(null);
    const [source, setSource] = useState(null); // 'database' | 'google'
    const googleSearchDone = useRef(false);

    // Step 1 — DB comparison (runs as soon as we have location + mosques)
    useEffect(() => {
        if (!userLocation || !mosques.length) return;

        const sorted = mosques
            .filter((m) => Number(m.latitude) && Number(m.longitude))
            .map((m) => ({
                ...m,
                dist: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    Number(m.latitude),
                    Number(m.longitude)
                ),
            }))
            .sort((a, b) => a.dist - b.dist);

        if (sorted.length > 0) {
            setNearest(sorted[0]);
            setSource("database");
        }
    }, [userLocation, mosques]);

    // Step 2 — Google Places enrichment (polls until SDK is ready, runs once)
    useEffect(() => {
        if (!userLocation || googleSearchDone.current) return;

        const tryGoogleSearch = () => {
            if (!window.google?.maps?.places) return false; // not ready yet

            googleSearchDone.current = true;

            // Snapshot of current db nearest for comparison inside the async callback
            const dbSorted = mosques
                .filter((m) => Number(m.latitude) && Number(m.longitude))
                .map((m) => ({
                    ...m,
                    dist: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        Number(m.latitude),
                        Number(m.longitude)
                    ),
                }))
                .sort((a, b) => a.dist - b.dist);
            const dbNearest = dbSorted[0] || null;

            // PlacesService needs an element when no map instance is available
            const el = document.createElement("div");
            document.body.appendChild(el);
            const service = new window.google.maps.places.PlacesService(el);

            service.nearbySearch(
                {
                    location: new window.google.maps.LatLng(
                        userLocation.lat,
                        userLocation.lng
                    ),
                    radius: 20000, // 20 km
                    keyword: "Ahmadiyya mosque",
                },
                (results, status) => {
                    if (document.body.contains(el)) document.body.removeChild(el);

                    if (
                        status !== window.google.maps.places.PlacesServiceStatus.OK ||
                        !results?.length
                    ) {
                        return; // DB result (if any) stays as the answer
                    }

                    const googleSorted = results
                        .filter((r) => r.geometry?.location)
                        .map((r) => ({
                            id: r.place_id,
                            name: r.name,
                            address: r.vicinity,
                            latitude: r.geometry.location.lat(),
                            longitude: r.geometry.location.lng(),
                            dist: calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                r.geometry.location.lat(),
                                r.geometry.location.lng()
                            ),
                            placeId: r.place_id,
                        }))
                        .sort((a, b) => a.dist - b.dist);

                    const googleNearest = googleSorted[0];

                    // Only update if Google found something closer than the DB result
                    if (
                        googleNearest &&
                        (!dbNearest || googleNearest.dist < dbNearest.dist)
                    ) {
                        setNearest(googleNearest);
                        setSource("google");
                    }
                }
            );

            return true;
        };

        // Try immediately; if SDK not loaded yet, poll every 800ms (up to 30s)
        if (tryGoogleSearch()) return;

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (tryGoogleSearch() || attempts > 37) clearInterval(interval);
        }, 800);

        return () => clearInterval(interval);
    }, [userLocation, mosques]);

    if (!nearest) return null;

    const locationText =
        nearest.address ||
        [nearest.state, nearest.region].filter(Boolean).join(", ");

    return (
        <div className="ahmadiyya-banner">
            <div className="ahmadiyya-banner-icon">
                <FaMosque />
            </div>

            <div className="ahmadiyya-banner-body">
                <span className="ahmadiyya-banner-label">
                    Nearest Ahmadiyya Mosque
                </span>
                <h3 className="ahmadiyya-banner-name">{nearest.name}</h3>
                <div className="ahmadiyya-banner-meta">
                    <FaMapMarkerAlt />
                    <span>{locationText}</span>
                    {nearest.dist != null && (
                        <span className="ahmadiyya-banner-distance">
                            {nearest.dist.toFixed(1)} km away
                        </span>
                    )}
                    {source === "google" && (
                        <span className="ahmadiyya-banner-source">via Google Maps</span>
                    )}
                </div>
            </div>

            <div className="ahmadiyya-banner-actions">
                {source === "database" && nearest.id && (
                    <Link
                        to={`/m/${nearest.id}`}
                        className="btn-primary"
                        style={{ fontSize: "14px", padding: "10px 18px" }}
                    >
                        View Details
                    </Link>
                )}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearest.latitude},${nearest.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ fontSize: "14px", padding: "10px 18px" }}
                >
                    <FaDirections /> Get Directions
                </a>
            </div>
        </div>
    );
}

export default NearestAhmadiyyaBanner;
