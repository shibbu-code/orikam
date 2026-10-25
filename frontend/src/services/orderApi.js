
import api from "./api";

// Create a COD order
export const createOrder = (orderData) => {
  return api.post("api/orders", orderData);
};

// Create Razorpay payment for a product order
export const createProductOrderPayment = (paymentData) => {
  return api.post("api/orders/payment/create", paymentData);
};

// Verify Razorpay payment and finalize the product order
export const verifyProductOrderPayment = (verificationData) => {
  return api.post("api/orders/payment/verify", verificationData);
};

// Get all orders for a user
export const getOrdersByUser = (userId) => {
  return api.get(`api/orders/user/${userId}`);
};

// Get a specific order
export const getOrderById = (orderId) => {
  return api.get(`api/orders/${orderId}`);
};

