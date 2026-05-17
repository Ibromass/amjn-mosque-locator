// ✅ Return number, not string

import { calculateDistance } from "./Location";
export const addDistanceToMosques = (mosques, userLoc) => {
  if (!userLoc || !mosques) return [];

  return mosques.map((m) => ({
    ...m,
    distanceKm: parseFloat(
      calculateDistance(
        userLoc.lat,
        userLoc.lng,
        m.latitude,
        m.longitude
      ).toFixed(2)
    ),
  }));
};