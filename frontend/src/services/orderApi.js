import api from "./api";

export const createOrder = (orderData) => {
  return api.post("/orders", orderData);
};

export const getOrdersByUser = (userId) => {
  return api.get(`/orders/user/${userId}`);
};

export const getOrderById = (orderId) => {
  return api.get(`/orders/${orderId}`);
};