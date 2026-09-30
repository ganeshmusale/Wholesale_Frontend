import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  loading = false
}) {
  if (totalItems === 0) return null;

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers window (max 5 visible buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.875rem 1.25rem',
      background: '#ffffff',
      borderTop: '1px solid var(--card-border)',
      flexWrap: 'wrap',
      gap: '0.75rem',
      borderRadius: '0 0 var(--radius) var(--radius)'
    }}>
      {/* Showing count indicator */}
      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
        Showing <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{start}</strong> to{' '}
        <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{end}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalItems}</strong> entries
        <span style={{
          marginLeft: '0.5rem',
          padding: '0.15rem 0.45rem',
          fontSize: '0.725rem',
          background: 'var(--page-bg)',
          borderRadius: '0.25rem',
          color: 'var(--text-muted)'
        }}>
          (10 per page)
        </span>
      </div>

      {/* Page navigation controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {/* First page button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || loading}
          title="First page"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous page button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          title="Previous page"
          style={{ padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
        >
          <ChevronLeft size={14} />
          <span style={{ fontSize: '0.78rem' }}>Prev</span>
        </button>

        {/* Page buttons */}
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            disabled={loading}
            style={{
              minWidth: '2rem',
              height: '2rem',
              padding: '0 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: pageNum === currentPage ? '1px solid #4f46e5' : '1px solid var(--card-border)',
              background: pageNum === currentPage ? '#4f46e5' : '#ffffff',
              color: pageNum === currentPage ? '#ffffff' : 'var(--text-primary)',
              cursor: pageNum === currentPage ? 'default' : 'pointer',
              boxShadow: pageNum === currentPage ? '0 1px 3px rgba(79, 70, 229, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {pageNum}
          </button>
        ))}

        {/* Next page button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          title="Next page"
          style={{ padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
        >
          <span style={{ fontSize: '0.78rem' }}>Next</span>
          <ChevronRight size={14} />
        </button>

        {/* Last page button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || loading}
          title="Last page"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
