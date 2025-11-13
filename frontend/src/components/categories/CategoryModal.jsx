import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createCategory, updateCategory } from "../../api/category";
import { useCategoryUiStore } from "../../store/categoryUiStore";

const CategoryModal = () => {
  const queryClient = useQueryClient();
  const { closeModal, editingCategory } = useCategoryUiStore();
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
      });
    } else {
      setFormData({ name: "", type: "EXPENSE" });
    }
  }, [editingCategory]);

  const mutation = useMutation({
    mutationFn: editingCategory
      ? (data) => updateCategory(editingCategory.id, data)
      : createCategory,
    onSuccess: () => {
      toast.success(
        `Category ${editingCategory ? "updated" : "created"} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      closeModal();
    },
    onError: (error) => {
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.name?.[0] ||
        "Something went wrong";
      toast.error(detail);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal
      title={editingCategory ? "Edit Category" : "New Category"}
      onClose={closeModal}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-200">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["INCOME", "EXPENSE"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setFormData((prev) => ({ ...prev, type: type }))}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  formData.type === type
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {type === "INCOME" ? "Income" : "Expense"}
              </button>
            ))}
          </div>
        </div>

        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Category name"
          required
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
