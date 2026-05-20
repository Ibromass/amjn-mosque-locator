const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
let googleMapsPromise;

const loadGoogleMaps = () => {
    if (window.google?.maps?.Geocoder) {
        return Promise.resolve(window.google);
    }

    if (!googleMapsApiKey) {
        return Promise.reject(
            new Error("Google Maps is not configured. Add VITE_GOOGLE_MAPS_KEY to your .env file.")
        );
    }

    if (!googleMapsPromise) {
        googleMapsPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector("script[data-amjn-google-maps]");
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(window.google));
                existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.dataset.amjnGoogleMaps = "true";
            script.onload = () => resolve(window.google);
            script.onerror = () => reject(new Error("Failed to load Google Maps"));
            document.head.appendChild(script);
        });
    }

    return googleMapsPromise;
};

const buildAhmadiyyaQuery = ({ name, address, state, region }) => {
    return [
        "Ahmadiyya Muslim Jamaat Mosque",
        name,
        address,
        state,
        region,
        "Nigeria",
    ]
        .filter(Boolean)
        .join(", ");
};

export const GoogleGeocoding = {
    findAhmadiyyaCoordinates: async ({ name, address, state, region }) => {
        const google = await loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();
        const query = buildAhmadiyyaQuery({ name, address, state, region });

        if (!query.trim()) {
            throw new Error("Enter a mosque name or address before finding coordinates.");
        }

        const response = await geocoder.geocode({
            address: query,
            componentRestrictions: { country: "NG" },
            region: "ng",
        });

        const result = response.results?.[0];
        if (!result?.geometry?.location) {
            throw new Error("No Ahmadiyya mosque location was found for this address.");
        }

        return {
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng(),
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
        };
    },
};
