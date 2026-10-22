import api from "./api";

export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.append("search", filters.search);
  }

  if (filters.category) {
    params.append("category", filters.category);
  }

  if (filters.brand) {
    params.append("brand", filters.brand);
  }

  if (filters.minPrice) {
    params.append("minPrice", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.append("maxPrice", filters.maxPrice);
  }

  if (filters.sort) {
    params.append("sort", filters.sort);
  }

  return api.get(`api/products?${params.toString()}`);
};

export const getHotSellingProducts = () => {
  return api.get("api/products/hot-selling");
};

export const getProductsByCategory = (categoryId) => {
  return api.get(`api/products/category/${categoryId}`);
};

export const getProductsByBrand = (brandId) => {
  return api.get(`api/products/brand/${brandId}`);
};

export const getProductById = (productId) => {
  return api.get(`api/products/${productId}`);
};

export const getSimilarProducts = (productId) =>
  api.get(`api/products/${productId}/similar`);