import { calculateDistance } from "./Location";

export const addDistanceToMosques = (mosques, userLoc) => {
  if (!userLoc || !mosques) return [];

  return mosques.map((m) => ({
    ...m,
    distanceKm: calculateDistance(
      userLoc.lat,
      userLoc.lng,
      m.latitude,
      m.longitude
    ),
  }));
};