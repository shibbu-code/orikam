import api from "./api";

export const getWarehouses = () => {
return api.get("api/warehouses");
};

export const createWarehouse = (data) => {
return api.post("api/warehouses", data);
};

export const getWarehouseInventory = (warehouseId) => {
return api.get(`api/warehouses/${warehouseId}/inventory`);
};

export const addWarehouseStock = (warehouseId, data) => {
return api.post(`api/warehouses/${warehouseId}/inventory`, data);
};

export const updateWarehouseStock = (warehouseId, productId, quantity) => {
return api.put(
`api/warehouses/${warehouseId}/inventory/${productId}`,
{ quantity }
);
};

export const getProductsForWarehouse = () => {
return api.get("api/products");
};
