import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaMapMarkerAlt, FaSpinner, FaExclamationCircle } from "react-icons/fa";

function NavBar({ onSearch }) {
    const [query, setQuery] = useState("");
    const [locationState, setLocationState] = useState("idle"); // idle | detecting | found | denied
    const [locationText, setLocationText] = useState("Current Location");

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationState("denied");
            setLocationText("Not supported");
            return;
        }

        setLocationState("detecting");
        setLocationText("Detecting...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Try reverse geocoding via Google if available, else show coords
                try {
                    if (window.google?.maps?.Geocoder) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode(
                            { location: { lat: latitude, lng: longitude } },
                            (results, status) => {
                                if (status === "OK" && results?.[0]) {
                                    // Extract city/town component
                                    const locality = results[0].address_components.find(
                                        (c) =>
                                            c.types.includes("locality") ||
                                            c.types.includes("administrative_area_level_2")
                                    );
                                    const country = results[0].address_components.find((c) =>
                                        c.types.includes("country")
                                    );
                                    const label = [locality?.short_name, country?.short_name]
                                        .filter(Boolean)
                                        .join(", ");
                                    setLocationText(label || `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);
                                } else {
                                    setLocationText(`${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);
                                }
                                setLocationState("found");
                            }
                        );
                    } else {
                        setLocationText(`${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);
                        setLocationState("found");
                    }
                } catch {
                    setLocationText(`${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);
                    setLocationState("found");
                }
            },
            () => {
                setLocationState("denied");
                setLocationText("Location denied");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    // Auto-detect on mount
    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    return (
        <header className="top-bar">
            {onSearch && (
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleChange}
                        className="search-input"
                        placeholder="Search by name, state, region..."
                    />
                </div>
            )}

            <button
                className={`location-indicator location-indicator--btn ${locationState}`}
                onClick={detectLocation}
                title={locationState === "denied" ? "Click to try again" : "Click to refresh location"}
                aria-label="Refresh current location"
            >
                {locationState === "detecting" ? (
                    <FaSpinner className="location-spinner" />
                ) : locationState === "denied" ? (
                    <FaExclamationCircle style={{ color: "var(--red)" }} />
                ) : (
                    <FaMapMarkerAlt style={{ color: locationState === "found" ? "var(--green)" : undefined }} />
                )}
                <span>{locationText}</span>
            </button>
        </header>
    );
}

export default NavBar;
