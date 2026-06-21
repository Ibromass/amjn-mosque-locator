import { useState, useRef, useEffect, useCallback } from "react";
import { FaSearch, FaMosque, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { calculateDistance } from "../Api/Location";

/**
 * Ahmadiyya-specific map search.
 * 1. Filters the loaded mosque database instantly as the user types.
 * 2. If fewer than 3 DB results, supplements with a Google Places
 *    text search prefixed "Ahmadiyya mosque <query>" so every
 *    suggestion is guaranteed to be Ahmadiyya-related.
 */
function MosqueMapSearch({ mosques, userLocation, onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const googleTimerRef = useRef(null);
    const activeQueryRef = useRef("");

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const searchDB = useCallback(
        (q) => {
            if (!q.trim()) return [];
            const lower = q.toLowerCase();
            return mosques
                .filter(
                    (m) =>
                        m.name?.toLowerCase().includes(lower) ||
                        m.state?.toLowerCase().includes(lower) ||
                        m.region?.toLowerCase().includes(lower) ||
                        m.jamaat?.toLowerCase().includes(lower) ||
                        m.address?.toLowerCase().includes(lower)
                )
                .slice(0, 8)
                .map((m) => ({
                    id: m.id,
                    name: m.name,
                    subtitle: [m.state, m.region].filter(Boolean).join(", "),
                    latitude: Number(m.latitude),
                    longitude: Number(m.longitude),
                    dist:
                        userLocation && m.latitude && m.longitude
                            ? calculateDistance(
                                  userLocation.lat,
                                  userLocation.lng,
                                  Number(m.latitude),
                                  Number(m.longitude)
                              )
                            : null,
                    source: "database",
                    original: m,
                }));
        },
        [mosques, userLocation]
    );

    const searchGoogle = useCallback(
        (q, existingIds) => {
            if (!window.google?.maps?.places) return;
            setGoogleLoading(true);

            const service = new window.google.maps.places.PlacesService(
                document.createElement("div")
            );

            service.textSearch(
                { query: `Ahmadiyya mosque ${q}` },
                (results, status) => {
                    // Only apply if this is still the current query
                    if (activeQueryRef.current !== q) return;
                    setGoogleLoading(false);

                    if (
                        status !== window.google.maps.places.PlacesServiceStatus.OK ||
                        !results?.length
                    )
                        return;

                    const googleResults = results
                        .filter((r) => r.geometry?.location)
                        .slice(0, 5)
                        .map((r) => ({
                            id: r.place_id,
                            name: r.name,
                            subtitle: r.formatted_address || r.vicinity || "",
                            latitude: r.geometry.location.lat(),
                            longitude: r.geometry.location.lng(),
                            dist:
                                userLocation
                                    ? calculateDistance(
                                          userLocation.lat,
                                          userLocation.lng,
                                          r.geometry.location.lat(),
                                          r.geometry.location.lng()
                                      )
                                    : null,
                            source: "google",
                            placeId: r.place_id,
                        }))
                        // Deduplicate against DB results already showing
                        .filter((r) => !existingIds.has(r.name.toLowerCase()));

                    setResults((prev) => {
                        // Keep DB results at top, append non-duplicate Google results
                        const dbResults = prev.filter((r) => r.source === "database");
                        return [...dbResults, ...googleResults].slice(0, 8);
                    });
                }
            );
        },
        [userLocation]
    );

    const handleChange = useCallback(
        (e) => {
            const q = e.target.value;
            setQuery(q);
            activeQueryRef.current = q;

            if (!q.trim()) {
                setResults([]);
                setOpen(false);
                setGoogleLoading(false);
                clearTimeout(googleTimerRef.current);
                return;
            }

            // Instant DB results
            const dbResults = searchDB(q);
            setResults(dbResults);
            setOpen(true);

            // Debounced Google Places supplement (300ms)
            clearTimeout(googleTimerRef.current);
            if (window.google?.maps?.places) {
                googleTimerRef.current = setTimeout(() => {
                    const existingNames = new Set(
                        dbResults.map((r) => r.name.toLowerCase())
                    );
                    searchGoogle(q, existingNames);
                }, 300);
            }
        },
        [searchDB, searchGoogle]
    );

    const handleSelect = useCallback(
        (result) => {
            setQuery(result.name);
            setOpen(false);
            onSelect?.(result);
        },
        [onSelect]
    );

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={wrapperRef} className="mosque-map-search">
            <div className="mosque-map-search-input-wrap">
                <FaSearch className="mosque-map-search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim() && setOpen(true)}
                    placeholder="Search Ahmadiyya mosques..."
                    className="mosque-map-search-input"
                    autoComplete="off"
                />
                {googleLoading && (
                    <FaSpinner className="mosque-map-search-spinner" />
                )}
            </div>

            {open && results.length > 0 && (
                <ul className="mosque-map-search-dropdown">
                    {results.map((r) => (
                        <li
                            key={`${r.source}-${r.id}`}
                            className="mosque-map-search-item"
                            onMouseDown={(e) => {
                                e.preventDefault(); // prevent blur before click
                                handleSelect(r);
                            }}
                        >
                            <span className="mosque-map-search-item-icon">
                                <FaMosque />
                            </span>
                            <span className="mosque-map-search-item-body">
                                <span className="mosque-map-search-item-name">
                                    {r.name}
                                </span>
                                <span className="mosque-map-search-item-sub">
                                    {r.subtitle}
                                    {r.dist != null && (
                                        <> &middot; {r.dist.toFixed(1)} km</>
                                    )}
                                </span>
                            </span>
                            {r.source === "google" && (
                                <span className="mosque-map-search-item-badge">
                                    Google
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {open && query.trim() && results.length === 0 && !googleLoading && (
                <div className="mosque-map-search-empty">
                    No Ahmadiyya mosques found for &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    );
}

export default MosqueMapSearch;
