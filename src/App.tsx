/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { Toolbar } from './components/Toolbar';
import { DocumentTable } from './components/DocumentTable';
import { DocumentModal } from './components/DocumentModal';
import { BulkImportModal } from './components/BulkImportModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { mockApi } from './services/mockApi';
import type { Document, DocumentCategory, DocumentStatus } from './types';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

// Toast portal renderer component
const ToastPortal: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={18} className="toast-icon-success" />;
      case 'error':
        return <AlertTriangle size={18} className="toast-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-warning" />;
      case 'info':
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-message-item toast-type-${toast.type}`}>
          {getToastIcon(toast.type)}
          <span className="toast-text">{toast.message}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => dismissToast(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Content
const DashboardContent: React.FC = () => {
  const { userRole, currentUser, triggerRefresh, refreshList, showToast, t } = useApp();

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [status, setStatus] = useState<DocumentStatus | 'ALL'>('ALL');

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

  // Fetch documents matching filters & pagination parameters
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await mockApi.getDocuments({
        page: currentPage,
        limit: pageSize,
        search,
        category,
        status,
        userRole,
        currentUser,
      });
      setDocuments(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, category, status, userRole, currentUser, showToast]);

  // Compute live KPIs metrics matching active role scope
  const calculateMetrics = useCallback(async () => {
    try {
      const allScopedDocs = await mockApi.getDocuments({
        page: 1,
        limit: 1000000,
        search: '',
        category: 'ALL',
        status: 'ALL',
        userRole,
        currentUser,
      });

      const list = allScopedDocs.data;
      const total = list.length;
      const pending = list.filter((d) => d.status === 'Pending').length;
      const approved = list.filter((d) => d.status === 'Approved').length;
      
      const uniqueCats = new Set(list.map((d) => d.category));

      setStats({
        total,
        pending,
        approved,
        categoriesCount: uniqueCats.size,
      });
    } catch {
      // Silently catch stats errors
    }
  }, [userRole, currentUser]);

  // Sync fetching on triggers
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, triggerRefresh]);

  // Sync stats calculations
  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics, triggerRefresh]);

  // Reset to first page when search filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: DocumentCategory | 'ALL') => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: DocumentStatus | 'ALL') => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Add Document handler
  const handleSaveDocument = async (docPayload: Omit<Document, 'id' | 'createdDate'>) => {
    await mockApi.createDocument(docPayload);
    showToast(t('addSuccess'), 'success');
    refreshList();
  };

  // Inline Edit Save handler
  const handleInlineSave = async (id: string, updatedFields: Partial<Document>) => {
    await mockApi.updateDocument(id, updatedFields);
    showToast(t('editSuccess'), 'success');
    refreshList();
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
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
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation & controls */}
      <Sidebar />

      {/* Main workspace section */}
      <main className="main-content-layout">
        {/* Dynamic header navigation */}
        <Header />

        {/* Live metric summary cards */}
        <StatsBanner
          total={stats.total}
          pending={stats.pending}
          approved={stats.approved}
          categoriesCount={stats.categoriesCount}
        />

        {/* Filters and search triggers */}
        <Toolbar
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
          onAddClick={() => setIsAddModalOpen(true)}
          onImportClick={() => setIsImportModalOpen(true)}
        />

        {/* Main interactive table view */}
        <DocumentTable
          documents={documents}
          loading={loading}
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEditSave={handleInlineSave}
          onDeleteClick={(doc) => setDocumentToDelete(doc)}
        />
      </main>

      {/* Modals & Dialog Portals */}
      <DocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveDocument}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={refreshList}
      />

      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
        loading={isDeleting}
      />

      {/* Overlay Toast system alerts */}
      <ToastPortal />
    </div>
  );
};

// Root App Component wrapped in Provider
function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
