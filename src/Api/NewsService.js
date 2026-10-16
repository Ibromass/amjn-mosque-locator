import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/api/news`;

const getToken = () => {
    try {
        const stored = localStorage.getItem("adminToken");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const request = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (response.ok) {
        return response.status === 204 ? null : response.json();
    }

    let message = `Request failed (${response.status})`;
    try {
        const body = await response.json();
        message = body.message || body.title || message;
    } catch {
        // Keep the status message when the server returns non-JSON text.
    }
    throw new Error(message);
};

const adminOptions = (method, body) => ({
    method,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
});

export const NewsService = {
    getAll: () => request(API_URL),
    create: (item) => request(API_URL, adminOptions("POST", item)),
    update: (id, item) => request(`${API_URL}/${id}`, adminOptions("PUT", item)),
    remove: (id) => request(`${API_URL}/${id}`, adminOptions("DELETE")),
};
