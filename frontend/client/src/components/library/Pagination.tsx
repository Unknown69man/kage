import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, hasNextPage, hasPrevPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-card border border-border/50 rounded-lg">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {currentPage > 3 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 p-0"
            >
              1
            </Button>
            <span className="text-muted-foreground">...</span>
          </>
        )}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8 p-0"
          >
            {page}
          </Button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            <span className="text-muted-foreground">...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <span className="text-xs text-muted-foreground ml-4 font-mono">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
