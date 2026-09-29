import api from "./api";

export const getCart = (userId) => {
  return api.get(`/cart/${userId}`);
};

export const updateCartItem = (userId, productId, quantity) => {
  return api.put("/cart/update", {
    userId,
    productId,
    quantity,
  });
};

export const removeCartItem = (userId, productId) => {
  return api.delete("/cart/remove", {
    data: {
      userId,
      productId,
    },
  });
};