import api from "./api";
export const getCategories = (limit) => {
  return api.get(
    limit
      ? `api/categories?limit=${limit}`
      : "api/categories"
  );
};