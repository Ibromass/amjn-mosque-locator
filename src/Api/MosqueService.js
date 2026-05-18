// Api/MosqueService.js
import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/api/mosque`;

const getToken = () => {
    try {
        return JSON.parse(localStorage.getItem("adminToken"));
    } catch {
        return null;
    }
};

const unwrapValues = (value) => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.$values)) return value.$values;
    if (value && Array.isArray(value.data)) return value.data;
    if (value && value.data && Array.isArray(value.data.$values)) return value.data.$values;
    return value;
};

// ✅ FIXED: Handle single string from backend
const normalizeImageUrl = (imageUrl) => {
    if (typeof imageUrl === "string" && imageUrl.trim()) return imageUrl.trim();
    if (Array.isArray(imageUrl) && imageUrl.length > 0) return imageUrl[0]; // Take first if array
    return null;
};

const getErrorMessage = async (res, fallback) => {
    try {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const error = await res.json();
            return error.message || error.title || error.error || fallback;
        }
        const text = await res.text();
        return text || fallback;
    } catch {
        return fallback;
    }
};

const buildMosquePayload = (data) => ({
    ...data,
    imageUrl: normalizeImageUrl(data.imageUrl),
});

const request = async (url, options) => {
    try {
        return await fetch(url, options);
    } catch (error) {
        throw new Error(`Could not connect to API at ${url}. ${error.message}`);
    }
};

const normalizeMosque = (mosque) => {
    if (!mosque) return mosque;

    return {
        ...mosque,
        id: mosque.id ?? mosque.mosqueId ?? mosque.Id,
        name: mosque.name ?? mosque.Name ?? "",
        address: mosque.address ?? mosque.Address ?? "",
        state: mosque.state ?? mosque.State ?? "",
        region: mosque.region ?? mosque.Region ?? "",
        circuit: mosque.circuit ?? mosque.Circuit ?? "",
        jamaat: mosque.jamaat ?? mosque.Jamaat ?? "",
        contact: mosque.contact ?? mosque.Contact ?? "",
        latitude: Number(mosque.latitude ?? mosque.Latitude ?? 0),
        longitude: Number(mosque.longitude ?? mosque.Longitude ?? 0),
        dateCreated: mosque.dateCreated ?? mosque.DateCreated,
        imageUrl: normalizeImageUrl(mosque.imageUrl ?? mosque.ImageUrl), // ✅ Single string
    };
};

const normalizeMosques = (data) => {
    const mosques = unwrapValues(data);
    return Array.isArray(mosques) ? mosques.map(normalizeMosque) : [];
};

export const MosqueService = {
    // GET ALL MOSQUES
    getAll: async () => {
        const res = await request(API_URL);
        if (!res.ok) throw new Error("Failed to fetch mosques");
        return normalizeMosques(await res.json());
    },

    // GET SINGLE MOSQUE BY ID
    getById: async (id) => {
        const res = await request(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Mosque not found");
        return normalizeMosque(await res.json());
    },

    // GET NEARBY FROM BACKEND
    getNearby: async (lat, lng, radiusKm = 10) => {
        const res = await request(
            `${API_URL}/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`
        );
        if (!res.ok) throw new Error("Failed to fetch nearby mosques");
        return normalizeMosques(await res.json());
    },

    // CREATE - Send single string
    create: async (data) => {
        const res = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(buildMosquePayload(data)),
        });
        if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to create mosque"));
        return res.json();
    },

    // UPDATE - Send single string
    update: async (id, data) => {
        const res = await request(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(buildMosquePayload(data)),
        });
        if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update mosque"));
        return res.json();
    },

    // DELETE
    delete: async (id) => {
        const res = await request(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        if (!res.ok) throw new Error("Failed to delete mosque");
        return res.json();
    },
};
