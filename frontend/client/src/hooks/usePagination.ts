import { useState, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function usePagination<T>(items: T[], pageSize: number = 12) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems: items.length,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [items, currentPage, pageSize]);

  const goToPage = (page: number) => {
    const totalPages = Math.ceil(items.length / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  return {
    ...paginationData,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}
