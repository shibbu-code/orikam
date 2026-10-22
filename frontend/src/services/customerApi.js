import api from "./api";

export const getCustomers = () => {
  return api.get("api/customers");
};

export const getCustomerById = (customerId) => {
  return api.get(`api/customers/${customerId}`);
};

export const getCustomerOrders = (customerId) => {
  return api.get(`api/customers/${customerId}/orders`);
};