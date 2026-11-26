// ✅ Return number, not string

import { calculateDistance, hasValidCoordinates } from "./Location";
export const addDistanceToMosques = (mosques, userLoc) => {
  if (!hasValidCoordinates(userLoc?.lat, userLoc?.lng) || !Array.isArray(mosques)) return [];

  return mosques.map((m) => {
    const distance = hasValidCoordinates(m.latitude, m.longitude)
      ? calculateDistance(userLoc.lat, userLoc.lng, m.latitude, m.longitude)
      : NaN;
    return { ...m, distanceKm: Number.isFinite(distance) ? Number(distance.toFixed(2)) : null };
  });
};
