import api from "./api";

export const getCart = (userId) => {
  return api.get(`api/cart/${userId}`);
};

export const updateCartItem = (userId, productId, quantity) => {
  return api.put("api/cart/update", {
    userId,
    productId,
    quantity,
  });
};

export const removeCartItem = (userId, productId) => {
  return api.delete("api/cart/remove", {
    data: {
      userId,
      productId,
    },
  });
};