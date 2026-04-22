// Api/GooglePlaces.js

export const fetchNearbyMosques = (map, location) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location,
      radius: 5000,
      keyword: "Ahmadiyya mosque",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(results || []);
      } else {
        reject(status);
      }
    });
  });
};

export const getDistanceMatrix = (userLocation, destinations) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [userLocation],
        destinations,
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          resolve(response);
        } else {
          reject(status);
        }
      }
    );
  });
};