import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/transactions";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import Pagination from "../components/ui/Pagination";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import TransactionModal from "../components/transactions/TransactionModal";
import { useUiStore } from "../store/uiStore";

const TransactionsPage = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const { isModalOpen, openModal, setEditingTransaction } = useUiStore();

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["transactions", page, filters],
    queryFn: () => getTransactions({ page, ...filters }),
    keepPreviousData: true,
  });

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    openModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <Button onClick={handleNewTransaction}>Add Transaction</Button>
      </div>

      <TransactionFilters onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="text-red-500">Failed to load transactions.</p>
      ) : (
        <>
          <TransactionList transactions={data?.results || []} />
          <Pagination
            currentPage={page}
            totalCount={data?.count || 0}
            pageSize={10}
            onPageChange={setPage}
          />
        </>
      )}

      {isFetching && (
        <div className="fixed bottom-4 right-4">
          <Spinner />
        </div>
      )}

      {isModalOpen && <TransactionModal />}
    </div>
  );
};

export default TransactionsPage;
