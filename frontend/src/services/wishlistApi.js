import api from "./api";

export const getWishlist = (userId) => {
  return api.get(`/wishlist/${userId}`);
};

export const addToWishlist = (userId, productId) => {
  return api.post("/wishlist", {
    userId,
    productId,
  });
};

export const removeFromWishlist = (userId, productId) => {
  return api.delete("/wishlist", {
    data: {
      userId,
      productId,
    },
  });
};