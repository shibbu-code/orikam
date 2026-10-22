import api from "./api";

export const getBrands = () => {
  return api.get("api/brands");
};
export const getBrandById = (brandId) => {
  return api.get(`api/brands/${brandId}`);
};

export const addBrand = (data) => {
  return api.post("api/brands", data);
};

export const updateBrand = (brandId, data) => {
  return api.put(`api/brands/${brandId}`, data);
};

export const updateBrandStatus = (brandId, isActive) => {
  return api.patch(`api/brands/${brandId}/status`, {
    isActive,
  });
};