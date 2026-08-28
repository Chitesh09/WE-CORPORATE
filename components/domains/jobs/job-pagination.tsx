"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function JobPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: JobPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-2 pt-6 border-t border-border-subtle"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevPage}
        onClick={() => navigateToPage(currentPage - 1)}
        className="text-xs h-9 px-3"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => navigateToPage(pageNum)}
            aria-label={`Page ${pageNum}`}
            aria-current={pageNum === currentPage ? "page" : undefined}
            className={`h-9 w-9 rounded-md text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-border-focus ${
              pageNum === currentPage
                ? "bg-brand-primary text-white"
                : "text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => navigateToPage(currentPage + 1)}
        className="text-xs h-9 px-3"
        aria-label="Go to next page"
      >
        Next <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  );
}
