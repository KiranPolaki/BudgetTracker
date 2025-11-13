import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCategories,
  deleteCategory,
  createDefaultCategories,
} from "../api/category";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import CategoryList from "../components/categories/CategoryList";
import CategoryModal from "../components/categories/CategoryModal";
import { useCategoryUiStore } from "../store/categoryUiStore";
import Card from "../components/ui/Card";
import { Layers, Wand2 } from "lucide-react";

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { isModalOpen, openModal, setEditingCategory } = useCategoryUiStore();
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ ordering: "name" }),
  });

  const categories = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.results || [];
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: (categoryId) => deleteCategory(categoryId),
    onSuccess: () => {
      toast.success("Category deleted!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      setCategoryToDelete(null);
    },
    onError: () => toast.error("Failed to delete category."),
  });

  const defaultsMutation = useMutation({
    mutationFn: createDefaultCategories,
    onSuccess: (response) => {
      toast.success(response?.message || "Default categories created!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to create default categories."),
  });

  const handleCreate = () => {
    setEditingCategory(null);
    openModal();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    openModal();
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  return (
    <div className="min-h-screen p-6 text-zinc-100 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            Categories
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your income and expense categories to keep transactions
            organized.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => defaultsMutation.mutate()}
            disabled={defaultsMutation.isLoading}
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {defaultsMutation.isLoading ? "Adding..." : "Add defaults"}
          </Button>
          <Button onClick={handleCreate}>Add Category</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="bg-rose-950/40 border border-rose-900/50 p-6 rounded-xl">
          <p className="text-rose-300 text-center">
            Failed to load categories. Please try again later.
          </p>
        </Card>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={setCategoryToDelete}
        />
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4">
          <Spinner />
        </div>
      )}

      {categoryToDelete && (
        <Modal
          title="Delete Category"
          onClose={() => setCategoryToDelete(null)}
        >
          <p className="text-sm text-zinc-300">
            Deleting{" "}
            <span className="font-semibold text-zinc-100">
              {categoryToDelete.name}
            </span>{" "}
            will remove it from future transaction choices. Existing
            transactions remain unchanged.
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <Button
              variant="secondary"
              onClick={() => setCategoryToDelete(null)}
              disabled={deleteMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}

      {isModalOpen && <CategoryModal />}
    </div>
  );
};

export default CategoriesPage;

