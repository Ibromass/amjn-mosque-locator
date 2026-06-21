import { useState, useEffect, useRef, useCallback } from "react";
import {
    FaCompass,
    FaMapMarkerAlt,
    FaRedo,
    FaExclamationTriangle,
    FaCheckCircle,
    FaMosque,
    FaInfoCircle,
} from "react-icons/fa";

/* ─── Kaaba coordinates (Mecca, Saudi Arabia) ─── */
const KAABA = { lat: 21.4225, lng: 39.8262 };

function toRad(d) { return (d * Math.PI) / 180; }
function toDeg(r) { return (r * 180) / Math.PI; }

/** Great-circle bearing from a point to the Kaaba (degrees from North, clockwise) */
function calcQiblahBearing(lat, lng) {
    const φ1 = toRad(lat);
    const φ2 = toRad(KAABA.lat);
    const Δλ = toRad(KAABA.lng - lng);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Haversine distance (km) */
function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Convert bearing to compass label */
function bearingLabel(deg) {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
}

/* ─── SVG Compass ─── */
const CARDINALS = [
    { a: 0, label: "N", major: true, north: true },
    { a: 45, label: "NE", major: false },
    { a: 90, label: "E", major: true },
    { a: 135, label: "SE", major: false },
    { a: 180, label: "S", major: true },
    { a: 225, label: "SW", major: false },
    { a: 270, label: "W", major: true },
    { a: 315, label: "NW", major: false },
];

function CompassSVG({ ringRotation, qiblahAngle, animated }) {
    // ringRotation: rotate the outer ring so N always points magnetic north (-deviceHeading)
    // qiblahAngle: where the Qiblah arrow points (qiblahBearing - deviceHeading)
    const cx = 150, cy = 150;

    const tickLines = [];
    for (let i = 0; i < 72; i++) {
        const angleDeg = i * 5;
        const rad = toRad(angleDeg);
        const isMajor = angleDeg % 90 === 0;
        const isMid = angleDeg % 45 === 0;
        const len = isMajor ? 20 : isMid ? 14 : 8;
        const r1 = 136;
        const r2 = r1 - len;
        tickLines.push(
            <line
                key={i}
                x1={cx + r1 * Math.sin(rad)}
                y1={cy - r1 * Math.cos(rad)}
                x2={cx + r2 * Math.sin(rad)}
                y2={cy - r2 * Math.cos(rad)}
                stroke={isMajor ? "#1f2937" : isMid ? "#6b7280" : "#d1d5db"}
                strokeWidth={isMajor ? 2.5 : 1.2}
            />
        );
    }

    const transitionStyle = animated
        ? { transition: "transform 0.08s linear" }
        : {};

    return (
        <svg viewBox="0 0 300 300" className="qiblah-compass-svg" aria-label="Qiblah compass">
            <defs>
                <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f0fdf4" />
                    <stop offset="100%" stopColor="#dcfce7" />
                </radialGradient>
                <filter id="needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#16a34a" floodOpacity="0.35" />
                </filter>
                <filter id="ring-shadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="4" stdDeviation="10" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Outer ring (rotates with device heading) */}
            <g
                transform={`rotate(${ringRotation} ${cx} ${cy})`}
                style={transitionStyle}
            >
                {/* Ring background */}
                <circle cx={cx} cy={cy} r="142" fill="white" filter="url(#ring-shadow)" />
                <circle cx={cx} cy={cy} r="142" fill="none" stroke="#e5e7eb" strokeWidth="1" />

                {/* Tick marks */}
                {tickLines}

                {/* Cardinal labels */}
                {CARDINALS.map(({ a, label, north }) => {
                    const rad = toRad(a);
                    const r = 112;
                    return (
                        <text
                            key={label}
                            x={cx + r * Math.sin(rad)}
                            y={cy - r * Math.cos(rad)}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={north ? "#dc2626" : "#1f2937"}
                            fontSize={label.length === 1 ? 20 : 13}
                            fontWeight="800"
                            fontFamily="system-ui, sans-serif"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Red North triangle */}
                <polygon
                    points={`${cx},${cy - 136} ${cx - 5},${cy - 122} ${cx + 5},${cy - 122}`}
                    fill="#dc2626"
                />
            </g>

            {/* Inner circle */}
            <circle cx={cx} cy={cy} r="88" fill="url(#bg-grad)" stroke="#bbf7d0" strokeWidth="2" />

            {/* Qiblah needle (independent rotation) */}
            <g
                transform={`rotate(${qiblahAngle} ${cx} ${cy})`}
                style={transitionStyle}
                filter="url(#needle-shadow)"
            >
                {/* Green "toward Kaaba" arrow */}
                <polygon
                    points={`${cx},${cy - 78} ${cx - 10},${cy - 28} ${cx},${cy - 40} ${cx + 10},${cy - 28}`}
                    fill="#16a34a"
                />
                {/* Gray tail arrow (opposite direction) */}
                <polygon
                    points={`${cx},${cy + 78} ${cx - 8},${cy + 28} ${cx},${cy + 40} ${cx + 8},${cy + 28}`}
                    fill="#9ca3af"
                />

                {/* Kaaba icon at green tip */}
                <rect x={cx - 10} y={cy - 96} width="20" height="18" rx="3" fill="#15803d" />
                <rect x={cx - 6} y={cy - 92} width="12" height="10" rx="1" fill="white" opacity="0.25" />
                {/* Door */}
                <rect x={cx - 2} y={cy - 82} width="4" height="4" rx="1" fill="white" opacity="0.6" />
                {/* Kiswa line */}
                <line x1={cx - 10} y1={cy - 87} x2={cx + 10} y2={cy - 87}
                    stroke="white" strokeWidth="1" opacity="0.4" />
            </g>

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="12" fill="#16a34a" />
            <circle cx={cx} cy={cy} r="6" fill="white" />
            <circle cx={cx} cy={cy} r="3" fill="#15803d" />

            {/* "QIBLAH" label below center */}
            <text x={cx} y={cy + 104} textAnchor="middle" fill="#15803d"
                fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif"
                letterSpacing="2">
                QIBLAH
            </text>
        </svg>
    );
}

/* ─── Desktop detection ─── */
const IS_MOBILE = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
);

/* ─── Main Page ─── */
function Qiblah() {
    const [locState, setLocState] = useState("idle"); // idle | loading | found | denied
    const [userLoc, setUserLoc] = useState(null);
    const [qiblahBearing, setQiblahBearing] = useState(null);
    const [distanceKm, setDistanceKm] = useState(null);
    const [cityName, setCityName] = useState(null);

    const [deviceHeading, setDeviceHeading] = useState(0);
    // compassState: "none" | "requesting" | "active" | "denied" | "desktop"
    const [compassState, setCompassState] = useState(IS_MOBILE ? "none" : "desktop");
    const [compassAccuracy, setCompassAccuracy] = useState(null);
    const orientationListenerRef = useRef(null);

    /* ── Get user location ── */
    const getLocation = useCallback(() => {
        setLocState("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserLoc({ lat, lng });
                setQiblahBearing(calcQiblahBearing(lat, lng));
                setDistanceKm(Math.round(calcDistance(lat, lng, KAABA.lat, KAABA.lng)));
                setLocState("found");

                // Reverse geocode city name if Google is loaded
                if (window.google?.maps?.Geocoder) {
                    const gc = new window.google.maps.Geocoder();
                    gc.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            const city =
                                results[0].address_components.find((c) =>
                                    c.types.includes("locality")
                                )?.long_name || null;
                            if (city) setCityName(city);
                        }
                    });
                }
            },
            () => setLocState("denied"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    /* ── Handle device orientation ── */
    const attachOrientationListener = useCallback(() => {
        if (orientationListenerRef.current) return;

        const handler = (e) => {
            // webkitCompassHeading is available on iOS and some Android browsers
            // alpha is the rotation around Z axis; on Android it may equal (360 - alpha)
            let heading;
            if (e.webkitCompassHeading != null) {
                heading = e.webkitCompassHeading;
                setCompassAccuracy(e.webkitCompassAccuracy);
            } else if (e.alpha != null) {
                heading = (360 - e.alpha) % 360;
            } else {
                return;
            }
            setDeviceHeading(heading);
            setCompassState("active");
        };

        window.addEventListener("deviceorientation", handler, true);
        orientationListenerRef.current = handler;
    }, []);

    const requestCompass = useCallback(async () => {
        setCompassState("requesting");
        try {
            if (typeof DeviceOrientationEvent?.requestPermission === "function") {
                // iOS 13+
                const perm = await DeviceOrientationEvent.requestPermission();
                if (perm === "granted") {
                    attachOrientationListener();
                } else {
                    setCompassState("denied");
                }
            } else {
                // Android / non-iOS
                attachOrientationListener();
                // Check if we got any data after 1.5s
                setTimeout(() => {
                    setCompassState((prev) => (prev === "requesting" ? "none" : prev));
                }, 1500);
            }
        } catch {
            setCompassState("denied");
        }
    }, [attachOrientationListener]);

    // Auto-request compass when location is found (mobile only)
    useEffect(() => {
        if (!IS_MOBILE) return;
        if (locState === "found" && compassState === "none") {
            if (typeof DeviceOrientationEvent?.requestPermission !== "function") {
                attachOrientationListener();
            }
        }
    }, [locState, compassState, attachOrientationListener]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (orientationListenerRef.current) {
                window.removeEventListener("deviceorientation", orientationListenerRef.current, true);
            }
        };
    }, []);

    /* ── Derived compass angles ── */
    const compassActive = compassState === "active";
    // On desktop: ring stays fixed (N at top), needle shows static bearing from North
    const ringRotation = compassActive ? -deviceHeading : 0;
    const qiblahAngle = qiblahBearing != null
        ? (compassActive ? qiblahBearing - deviceHeading : qiblahBearing)
        : 0;
    const facingQiblah = compassActive && Math.abs(((qiblahAngle % 360) + 360) % 360) < 8;

    /* ── Render ── */
    return (
        <div className="qiblah-page">
            {/* Page header */}
            <div className="page-header">
                <h1><FaCompass /> Qiblah Compass</h1>
                <p>Find the direction of the Kaaba in Mecca from your current location.</p>
            </div>

            {/* Facing-Qiblah celebration banner */}
            {facingQiblah && (
                <div className="qiblah-aligned-banner">
                    <FaCheckCircle /> You are facing the Qiblah! 🕋 Allahu Akbar!
                </div>
            )}

            {/* Compass card */}
            <div className="qiblah-card">
                {/* Location status strip */}
                {locState === "loading" && (
                    <div className="qiblah-status qiblah-status--loading">
                        <span className="qiblah-spinner" />
                        Detecting your location…
                    </div>
                )}
                {locState === "denied" && (
                    <div className="qiblah-status qiblah-status--error">
                        <FaExclamationTriangle />
                        Location access denied.&nbsp;
                        <button onClick={getLocation} className="qiblah-inline-btn">
                            Try again
                        </button>
                    </div>
                )}
                {locState === "found" && (
                    <div className="qiblah-status qiblah-status--ok">
                        <FaMapMarkerAlt />
                        {cityName ? `Location: ${cityName}` : "Location detected"}
                        <button onClick={getLocation} className="qiblah-inline-btn" title="Refresh location">
                            <FaRedo style={{ fontSize: 11 }} />
                        </button>
                    </div>
                )}

                {/* ── Compass visual ── */}
                <div className="qiblah-compass-wrap">
                    {locState === "idle" || locState === "loading" ? (
                        <div className="qiblah-compass-placeholder">
                            <FaCompass className="qiblah-placeholder-icon" />
                            <p>{locState === "loading" ? "Getting your location…" : "Tap below to start"}</p>
                        </div>
                    ) : locState === "denied" ? (
                        <div className="qiblah-compass-placeholder qiblah-compass-placeholder--error">
                            <FaExclamationTriangle className="qiblah-placeholder-icon" style={{ color: "#f97316" }} />
                            <p>Location required to show Qiblah direction</p>
                            <button className="btn-primary" style={{ marginTop: 16 }} onClick={getLocation}>
                                Allow Location
                            </button>
                        </div>
                    ) : (
                        <CompassSVG
                            ringRotation={ringRotation}
                            qiblahAngle={qiblahAngle}
                            animated={compassActive}
                        />
                    )}
                </div>

                {/* ── Info row ── */}
                {locState === "found" && qiblahBearing != null && (
                    <div className="qiblah-info-row">
                        <div className="qiblah-info-card">
                            <span className="qiblah-info-label">Qiblah Direction</span>
                            <span className="qiblah-info-value">
                                {Math.round(qiblahBearing)}°&nbsp;
                                <span className="qiblah-info-dir">{bearingLabel(qiblahBearing)}</span>
                            </span>
                        </div>
                        <div className="qiblah-info-card">
                            <span className="qiblah-info-label">Distance to Mecca</span>
                            <span className="qiblah-info-value">
                                {distanceKm?.toLocaleString()} <span className="qiblah-info-dir">km</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Compass activation / status ── */}
                {locState === "found" && compassState !== "active" && (
                    <div className="qiblah-compass-prompt">
                        {compassState === "desktop" ? (
                            <div className="qiblah-compass-denied">
                                <FaInfoCircle style={{ color: "#3b82f6", flexShrink: 0 }} />
                                <span>
                                    Live compass requires a <strong>mobile device</strong> with a built-in sensor.
                                    The arrow above shows your Qiblah bearing from North — face that direction to pray.
                                </span>
                            </div>
                        ) : compassState === "denied" ? (
                            <div className="qiblah-compass-denied">
                                <FaExclamationTriangle style={{ color: "#f97316", flexShrink: 0 }} />
                                <span>Compass permission denied. The arrow above shows the Qiblah bearing from North.</span>
                            </div>
                        ) : compassState === "requesting" ? (
                            <div className="qiblah-compass-denied">
                                <span className="qiblah-spinner" style={{ borderTopColor: "#16a34a" }} />
                                <span>Waiting for compass permission…</span>
                            </div>
                        ) : (
                            <button className="qiblah-compass-btn" onClick={requestCompass}>
                                <FaCompass /> Enable Live Compass
                            </button>
                        )}
                    </div>
                )}

                {/* ── Live compass status ── */}
                {compassActive && (
                    <div className="qiblah-compass-live">
                        <span className="qiblah-live-dot" />
                        Live compass active
                        {compassAccuracy != null && compassAccuracy > 0 && (
                            <span style={{ color: "#6b7280", marginLeft: 6, fontSize: 12 }}>
                                (accuracy ±{Math.round(compassAccuracy)}°)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── How to use ── */}
            <div className="qiblah-guide">
                <h3><FaInfoCircle /> How to Use</h3>
                <ol className="qiblah-guide-list">
                    <li>Allow location access so we can calculate your exact Qiblah bearing.</li>
                    {IS_MOBILE ? (
                        <>
                            <li>Tap <strong>Enable Live Compass</strong> to activate your device&apos;s sensor.</li>
                            <li>Hold your phone flat and rotate slowly until the <span style={{ color: "#16a34a", fontWeight: 700 }}>green arrow</span> points straight up — that&apos;s the Qiblah direction.</li>
                        </>
                    ) : (
                        <li>
                            <strong>On desktop:</strong> the compass shows your Qiblah bearing from North as a fixed arrow.
                            Use a physical compass or a mobile device to align yourself with the direction shown (e.g. <em>&quot;62° NE&quot;</em>).
                        </li>
                    )}
                    <li>Face that direction to pray toward the Kaaba in Mecca. 🕋</li>
                </ol>
                <p className="qiblah-guide-note">
                    <FaMosque style={{ marginRight: 6, color: "#16a34a" }} />
                    The Kaaba is located at <strong>21.4225°N, 39.8262°E</strong> in Makkah Al‑Mukarramah, Saudi Arabia.
                </p>
            </div>
        </div>
    );
}

export default Qiblah;
