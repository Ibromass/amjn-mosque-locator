import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
} from "@react-google-maps/api";

import { useEffect, useRef, useState } from "react";
import { MosqueService } from "../Api/MosqueService";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries = ["places"];

/* =========================
   DISTANCE HELPER (KM)
========================= */
const addDistanceToMosques = (mosques, userLoc) => {
  const toRad = (v) => (v * Math.PI) / 180;

  const calcKm = (aLat, aLng, bLat, bLng) => {
    const R = 6371;

    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(aLat)) *
        Math.cos(toRad(bLat)) *
        Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  };

  return mosques.map((m) => ({
    ...m,
    distanceKm: calcKm(
      userLoc.lat,
      userLoc.lng,
      m.latitude,
      m.longitude
    ).toFixed(2),
  }));
};

function MapView({ setMosques }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mosques, localSetMosques] = useState([]);
  const [selected, setSelected] = useState(null);
  const [map, setMap] = useState(null);

  const searchRef = useRef(null);

  /* =========================
     USER LOCATION
  ========================== */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUserLocation({ lat: 6.5244, lng: 3.3792 }); // fallback
      }
    );
  }, []);

  /* =========================
     LOAD MOSQUES + DISTANCE
  ========================== */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await MosqueService.getAll();

        navigator.geolocation.getCurrentPosition((pos) => {
          const userLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          setUserLocation(userLoc);

          const enriched = addDistanceToMosques(data, userLoc);

          localSetMosques(enriched);
          setMosques(enriched);
        });
      } catch (err) {
        console.error("Failed loading mosques:", err);
      }
    };

    load();
  }, []);

  /* =========================
     MAP READY
  ========================== */
  const onLoad = (mapInstance) => setMap(mapInstance);

  /* =========================
     DIRECTIONS
  ========================== */
  const openDirections = (mosque) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`,
      "_blank"
    );
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={libraries}
    >
      {/* SEARCH BOX */}
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
            width: "300px",
            padding: "10px",
            marginBottom: "10px",
          }}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || { lat: 6.5244, lng: 3.3792 }}
        zoom={13}
        onLoad={onLoad}
      >
        {/* USER LOCATION */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}

        {/* MOSQUES */}
        {mosques.map((m, i) => (
          <Marker
            key={i}
            position={{
              lat: m.latitude,
              lng: m.longitude,
            }}
            icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            onClick={() => setSelected(m)}
          />
        ))}

        {/* INFO WINDOW */}
        {selected && (
          <InfoWindow
            position={{
              lat: selected.latitude,
              lng: selected.longitude,
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h4>{selected.name}</h4>
              <p>{selected.distanceKm} km away</p>

              <button onClick={() => openDirections(selected)}>
                Get Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapView;