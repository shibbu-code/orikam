import api from "./api";

export const getCustomers = () => {
  return api.get("/customers");
};

export const getCustomerById = (customerId) => {
  return api.get(`/customers/${customerId}`);
};

export const getCustomerOrders = (customerId) => {
  return api.get(`/customers/${customerId}/orders`);
};