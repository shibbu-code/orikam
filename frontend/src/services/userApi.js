import api from "./api";

export const addRecentlyViewed = (userId, productId) => {
  return api.post("api/users/recently-viewed", {
    userId,
    productId,
  });
};

export const getRecentlyViewed = (userId) => {
  return api.get(`api/users/${userId}/recently-viewed`);
};