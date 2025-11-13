import apiClient from "./index";

export const getCategories = async (params = {}) => {
  const { data } = await apiClient.get("/categories/", { params });
  return data;
};

export const getCategory = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}/`);
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await apiClient.post("/categories/", categoryData);
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await apiClient.put(`/categories/${id}/`, categoryData);
  return data;
};

export const deleteCategory = async (id) => {
  await apiClient.delete(`/categories/${id}/`);
};

export const createDefaultCategories = async () => {
  const { data } = await apiClient.post("/categories/create_defaults/");
  return data;
};
