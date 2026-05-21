import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../Api/GoogleGeocoding";

const nigeriaCenter = { lat: 9.082, lng: 8.6753 };

const toCoordinate = (latitude, longitude) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat === 0 && lng === 0) return null;

    return { lat, lng };
};

function CoordinatePicker({ latitude, longitude, onChange }) {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const clickListenerRef = useRef(null);
    const [loadError, setLoadError] = useState("");

    const position = toCoordinate(latitude, longitude);

    useEffect(() => {
        let cancelled = false;

        const setupMap = async () => {
            try {
                const google = await loadGoogleMaps();
                if (cancelled || !mapElementRef.current || mapRef.current) return;

                mapRef.current = new google.maps.Map(mapElementRef.current, {
                    center: position || nigeriaCenter,
                    zoom: position ? 17 : 6,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                clickListenerRef.current = mapRef.current.addListener("click", (event) => {
                    const nextPosition = {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng(),
                    };
                    onChange(nextPosition);
                });
            } catch (error) {
                if (!cancelled) setLoadError(error.message);
            }
        };

        setupMap();

        return () => {
            cancelled = true;
            if (clickListenerRef.current) {
                clickListenerRef.current.remove();
                clickListenerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !window.google?.maps) return;

        if (!position) {
            markerRef.current?.setMap(null);
            markerRef.current = null;
            return;
        }

        if (!markerRef.current) {
            markerRef.current = new window.google.maps.Marker({
                map: mapRef.current,
                position,
                draggable: true,
                title: "Mosque location",
            });

            markerRef.current.addListener("dragend", (event) => {
                onChange({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                });
            });
        } else {
            markerRef.current.setPosition(position);
        }

        mapRef.current.panTo(position);
        if (mapRef.current.getZoom() < 16) {
            mapRef.current.setZoom(17);
        }
    }, [latitude, longitude]);

    return (
        <div className="coordinate-picker">
            <div className="coordinate-picker-header">
                <span>Location Preview</span>
                <small>Click map or drag marker to adjust</small>
            </div>
            {loadError ? (
                <p className="lookup-status error">{loadError}</p>
            ) : (
                <div ref={mapElementRef} className="coordinate-picker-map" />
            )}
        </div>
    );
}

export default CoordinatePicker;
