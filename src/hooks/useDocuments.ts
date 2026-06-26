/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { DOCUMENT_CATEGORY, DOCUMENT_STATUS } from '../types';
import type { Document } from '../types';
import { useDebounce } from './useDebounce';

export function useDocuments() {
  const { userRole, currentUser, triggerRefresh, refreshList, showToast, t } = useApp();

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<DOCUMENT_CATEGORY | 'ALL'>('ALL');
  const [status, setStatus] = useState<DOCUMENT_STATUS | 'ALL'>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // List data states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats states (total scope metrics)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    categoriesCount: 0,
  });

  // Modal toggle states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep showToast ref stable so it doesn't appear in effect deps
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  // Fetch documents — single effect watching all params, no stale closure
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const response = await mockApi.getDocuments({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          category,
          status,
          userRole,
          currentUser,
        });
        if (!cancelled) {
          setDocuments(response.data);
          setTotalRecords(response.total);
          if (response.stats) {
            setStats(response.stats);
          }
        }
      } catch (error: any) {
        if (!cancelled) showToastRef.current(error.message || 'Failed to fetch documents', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, debouncedSearch, category, status, userRole, currentUser, triggerRefresh]);

  // Reset to first page when search filters change
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((val: DOCUMENT_CATEGORY | 'ALL') => {
    setCategory(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: DOCUMENT_STATUS | 'ALL') => {
    setStatus(val);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Add Document handler
  const handleSaveDocument = useCallback(async (docPayload: Omit<Document, 'id' | 'createdDate'>) => {
    await mockApi.createDocument(docPayload);
    showToast(t('addSuccess'), 'success');
    refreshList();
  }, [showToast, refreshList, t]);

  // Inline Edit Save handler
  const handleInlineSave = useCallback(async (id: string, updatedFields: Partial<Document>) => {
    await mockApi.updateDocument(id, updatedFields);
    showToast(t('editSuccess'), 'success');
    refreshList();
  }, [showToast, refreshList, t]);

  // Delete handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      await mockApi.deleteDocument(documentToDelete.id);
      showToast(t('deleteSuccess'), 'success');
      setDocumentToDelete(null);

      // Handle page overflow backpage index decrement
      if (documents.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      refreshList();
    } catch (err: any) {
      showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [documentToDelete, documents.length, currentPage, showToast, refreshList, t]);

  return {
    search,
    category,
    status,
    currentPage,
    pageSize,
    documents,
    totalRecords,
    loading,
    stats,
    isAddModalOpen,
    isImportModalOpen,
    documentToDelete,
    isDeleting,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handlePageSizeChange,
    handleSaveDocument,
    handleInlineSave,
    handleDeleteConfirm,
    setIsAddModalOpen,
    setIsImportModalOpen,
    setDocumentToDelete,
    refreshList,
    t,
  };
}
