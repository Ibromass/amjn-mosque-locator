import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaMapMarkerAlt, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { getUserLocation } from "../Api/Location";

function NavBar({ onSearch }) {
    const [query, setQuery] = useState("");
    const [locationState, setLocationState] = useState("idle"); // idle | detecting | found | denied
    const [locationText, setLocationText] = useState("Current Location");

    const detectLocation = useCallback((forceRefresh = false) => {
        setLocationState("detecting");
        setLocationText("Detecting...");

        getUserLocation({ forceRefresh }).then(({ latitude, longitude }) => {
            const coordinateLabel = `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`;
            if (window.google?.maps?.Geocoder) {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                        const locality = results[0].address_components.find((c) =>
                            c.types.includes("locality") || c.types.includes("administrative_area_level_2")
                        );
                        const country = results[0].address_components.find((c) => c.types.includes("country"));
                        setLocationText(
                            [locality?.short_name, country?.short_name].filter(Boolean).join(", ") || coordinateLabel
                        );
                    } else {
                        setLocationText(coordinateLabel);
                    }
                    setLocationState("found");
                });
            } else {
                setLocationText(coordinateLabel);
                setLocationState("found");
            }
        }).catch(() => {
            setLocationText(navigator.geolocation ? "Location denied" : "Not supported");
            setLocationState("denied");
        });
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
                onClick={() => detectLocation(true)}
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
