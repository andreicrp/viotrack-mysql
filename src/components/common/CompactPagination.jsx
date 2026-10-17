import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import '../../css/compact-pagination.css';

export const CompactPagination = ({ currentPage, totalPages, onPageChange, ariaLabel = 'Pagination' }) => {
  const pageCount = Math.max(1, totalPages);
  const page = Math.min(currentPage, pageCount);

  return (
  <nav className="compact-pagination" aria-label={ariaLabel}>
    <button type="button" onClick={() => onPageChange(1)} disabled={page <= 1} aria-label="First page" title="First page">
      <ChevronsLeft size={15} aria-hidden="true" />
    </button>
    <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page" title="Previous page">
      <ChevronLeft size={15} aria-hidden="true" />
    </button>
    <span aria-current="page" aria-label={`Page ${page} of ${pageCount}`}>
      {page} / {pageCount}
    </span>
    <button type="button" onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount} aria-label="Next page" title="Next page">
      <ChevronRight size={15} aria-hidden="true" />
    </button>
    <button type="button" onClick={() => onPageChange(pageCount)} disabled={page >= pageCount} aria-label="Last page" title="Last page">
      <ChevronsRight size={15} aria-hidden="true" />
    </button>
  </nav>
  );
};
