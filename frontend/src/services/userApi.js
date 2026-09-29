import api from "./api";

export const addRecentlyViewed = (userId, productId) => {
  return api.post("/users/recently-viewed", {
    userId,
    productId,
  });
};

export const getRecentlyViewed = (userId) => {
  return api.get(`/users/${userId}/recently-viewed`);
};