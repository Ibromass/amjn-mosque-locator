// services/FavoriteService.js
const STORAGE_KEY = 'amjn_favorites';

const getFavorites = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const addFavorite = (mosque) => {
    const favorites = getFavorites();
    if (!favorites.find(f => f.id === mosque.id)) {
        favorites.push(mosque);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
    return favorites;
};

const removeFavorite = (mosqueId) => {
    const favorites = getFavorites().filter(f => f.id !== mosqueId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return favorites;
};

const isFavorite = (mosqueId) => {
    return getFavorites().some(f => f.id === mosqueId);
};

export const FavoriteService = {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite
};