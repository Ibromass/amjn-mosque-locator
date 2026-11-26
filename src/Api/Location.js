// src/Api/Location.js

const LOCATION_CACHE_KEY = "amjn-user-location";
const LOCATION_CACHE_MAX_AGE = 30 * 60 * 1000;
let cachedLocation = null;
let pendingLocation = null;

const readCachedLocation = () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(LOCATION_CACHE_KEY) || "null");
    if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_MAX_AGE &&
        hasValidCoordinates(cached.latitude, cached.longitude)) {
      return { latitude: Number(cached.latitude), longitude: Number(cached.longitude) };
    }
  } catch {
    // Storage may be unavailable; geolocation can still work without it.
  }
  return null;
};

const rememberLocation = (position) => {
  cachedLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  try {
    sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...cachedLocation, timestamp: Date.now() }));
  } catch {
    // Keep the in-memory cache when browser storage is unavailable.
  }
  return cachedLocation;
};

// Share the first approved location across routes so each feature does not
// independently prompt for or wait on the same browser location request.
export const getUserLocation = ({ forceRefresh = false } = {}) => {
  if (pendingLocation) return pendingLocation;
  cachedLocation ||= readCachedLocation();
  if (!forceRefresh && cachedLocation) return Promise.resolve(cachedLocation);
  const lastKnownLocation = cachedLocation;

  pendingLocation = new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(rememberLocation(position)),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }).catch((error) => {
    if (lastKnownLocation) return lastKnownLocation;
    throw error;
  }).finally(() => {
    pendingLocation = null;
  });
  return pendingLocation;
};

export const hasValidCoordinates = (latitude, longitude) => {
  if (latitude == null || longitude == null || latitude === "" || longitude === "") return false;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
};

// ✅ Distance calculation (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!hasValidCoordinates(lat1, lon1) || !hasValidCoordinates(lat2, lon2)) return NaN;
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);
  const R = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const boundedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(boundedA), Math.sqrt(1 - boundedA));

  return R * c;
};
