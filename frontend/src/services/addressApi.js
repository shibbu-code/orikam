
import api from "./api";

// Get all saved addresses
export const getUserAddresses = (userId) => {
  return api.get(`api/users/${userId}/addresses`);
};

// Add a new address
export const addUserAddress = (userId, addressData) => {
  return api.post(
    `api/users/${userId}/addresses`,
    addressData
  );
};

// Update an address
export const updateUserAddress = (
  userId,
  addressId,
  addressData
) => {
  return api.put(
    `api/users/${userId}/addresses/${addressId}`,
    addressData
  );
};

// Delete an address
export const deleteUserAddress = (userId, addressId) => {
  return api.delete(
    `api/users/${userId}/addresses/${addressId}`
  );
};

// Set default address
export const setDefaultUserAddress = (userId, addressId) => {
  return api.patch(
    `api/users/${userId}/addresses/${addressId}/default`
  );
};

