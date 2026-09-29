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

  return api.get(`/products?${params.toString()}`);
};

export const getHotSellingProducts = () => {
  return api.get("/products/hot-selling");
};

export const getProductsByCategory = (categoryId) => {
  return api.get(`/products/category/${categoryId}`);
};

export const getProductsByBrand = (brandId) => {
  return api.get(`/products/brand/${brandId}`);
};

export const getProductById = (productId) => {
  return api.get(`/products/${productId}`);
};

export const getSimilarProducts = (productId) =>
  api.get(`/products/${productId}/similar`);