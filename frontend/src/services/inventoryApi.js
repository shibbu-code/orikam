import api from "./api";

export const getInventory = () => {
  return api.get("api/inventory");
};

export const updateInventoryStock = (productId, stock) => {
  return api.patch(`api/inventory/${productId}/stock`, {
    stock,
  });
};