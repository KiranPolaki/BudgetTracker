import apiClient from "./index";

/**
 * Fetches a paginated list of categories.
 * Corresponds to the 'list' action in CategoryViewSet.
 * @param {object} params - Optional query params like page, search, ordering
 */
export const getCategories = async (params = {}) => {
  const { data } = await apiClient.get("/categories/", { params });
  return data;
};

/**
 * Fetches a single category by its ID.
 * Corresponds to the 'retrieve' action in CategoryViewSet.
 * @param {number} id - The ID of the category.
 */
export const getCategory = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}/`);
  return data;
};

/**
 * Creates a new category.
 * Corresponds to the 'create' action in CategoryViewSet.
 * @param {object} categoryData - { name: string, type: 'INCOME' | 'EXPENSE' }
 */
export const createCategory = async (categoryData) => {
  const { data } = await apiClient.post("/categories/", categoryData);
  return data;
};

/**
 * Updates an existing category.
 * Corresponds to the 'update' action in CategoryViewSet.
 * @param {number} id - The ID of the category to update.
 * @param {object} categoryData - { name: string, type: 'INCOME' | 'EXPENSE' }
 */
export const updateCategory = async (id, categoryData) => {
  const { data } = await apiClient.put(`/categories/${id}/`, categoryData);
  return data;
};

/**
 * Deletes a category.
 * Corresponds to the 'destroy' action in CategoryViewSet.
 * @param {number} id - The ID of the category to delete.
 */
export const deleteCategory = async (id) => {
  await apiClient.delete(`/categories/${id}/`);
};

/**
 * Creates the default set of categories for a user.
 * Corresponds to the 'create_defaults' custom action in CategoryViewSet.
 */
export const createDefaultCategories = async () => {
  const { data } = await apiClient.post("/categories/create_defaults/");
  return data;
};
