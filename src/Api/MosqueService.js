// Api/MosqueService.js

const API_URL = "http://localhost:5191/api/mosque";

const getToken = () => JSON.parse(localStorage.getItem("adminToken"));

export const MosqueService = {
  // GET ALL MOSQUES
  getAll: async () => {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error("Failed to fetch mosques");
    }

    return await res.json();
  },

  // GET NEARBY FROM BACKEND (if you use it)
  getNearby: async (lat, lng, radiusKm = 10) => {
    const res = await fetch(
      `${API_URL}/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch nearby mosques");
    }

    return await res.json();
  },

  // CREATE
  create: async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create mosque");
    return res.json();
  },

  // UPDATE
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update mosque");
    return res.json();
  },

  // DELETE
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete mosque");
    return res.json();
  },
};