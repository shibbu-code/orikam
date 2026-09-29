import api from "./api";

export const getBrands = () => {
  return api.get("/brands");
};
export const getBrandById = (brandId) => {
  return api.get(`/brands/${brandId}`);
};

export const addBrand = (data) => {
  return api.post("/brands", data);
};

export const updateBrand = (brandId, data) => {
  return api.put(`/brands/${brandId}`, data);
};

export const updateBrandStatus = (brandId, isActive) => {
  return api.patch(`/brands/${brandId}/status`, {
    isActive,
  });
};