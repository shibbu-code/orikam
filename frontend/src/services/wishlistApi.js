import api from "./api";

export const getWishlist = (userId) => {
  return api.get(`api/wishlist/${userId}`);
};

export const addToWishlist = (userId, productId) => {
  return api.post("api/wishlist", {
    userId,
    productId,
  });
};

export const removeFromWishlist = (userId, productId) => {
  return api.delete("api/wishlist", {
    data: {
      userId,
      productId,
    },
  });
};