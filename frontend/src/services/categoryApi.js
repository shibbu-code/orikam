import api from "./api";
export const getCategories = (limit) => {
  return api.get(
    limit
      ? `/categories?limit=${limit}`
      : "/categories"
  );
};