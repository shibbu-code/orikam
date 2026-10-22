import api from "./api";

export const createOrder = (orderData) => {
  return api.post("api/orders", orderData);
};

export const getOrdersByUser = (userId) => {
  return api.get(`api/orders/user/${userId}`);
};

export const getOrderById = (orderId) => {
  return api.get(`api/orders/${orderId}`);
};