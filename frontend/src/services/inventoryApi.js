import api from "./api";

export const getInventory = () => {
  return api.get("/inventory");
};

export const updateInventoryStock = (productId, stock) => {
  return api.patch(`/inventory/${productId}/stock`, {
    stock,
  });
};