/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { USER_ROLE } from '../types';
import { mockApi } from '../services/mockApi';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type LangType = 'en' | 'vi';

const TRANSLATIONS = {
  en: {
    title: 'EVD Document Registry',
    subtitle: 'Admin file management, verification and validation engine',
    searchPlaceholder: 'Search by title or document code...',
    status: 'Status',
    category: 'Category',
    all: 'All',
    createDoc: 'New Document',
    bulkImport: 'Bulk Import CSV',
    role: 'Role',
    currentUser: 'User',
    loading: 'Loading system registry...',
    emptyState: 'No documents match your filter criteria.',
    emptyAction: 'Clear filters or create a new document.',
    code: 'Document Code',
    docTitle: 'Document Title',
    createdBy: 'Created By',
    createdDate: 'Created Date',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteTitle: 'Delete Document',
    confirmDeleteMsg: 'Are you sure you want to permanently delete this EVD document? This action is irreversible.',
    addSuccess: 'Document successfully registered.',
    editSuccess: 'Document successfully updated.',
    deleteSuccess: 'Document successfully deleted.',
    totalDocs: 'Total Records',
    pendingDocs: 'Pending Reviews',
    approvedRate: 'Approved Rate',
    activeCats: 'Active Categories',

    // Sidebar
    sidebarRegistryTitle: 'EVD File Module',
    sidebarRegistryLink: 'Documents Registry',
    sidebarManagementTitle: 'Management',
    sidebarAccessControl: 'Access Controls',
    sidebarAuditLogs: 'System Audit Logs',
    sidebarRoleScope: 'Scope',
    sidebarResetDb: 'Reset Demo Database',
  },
  vi: {
    title: 'Quản lý tài liệu EVD',
    subtitle: 'Hệ thống quản lý, đối soát và xác thực tài liệu EVD',
    searchPlaceholder: 'Tìm kiếm theo tiêu đề hoặc mã tài liệu...',
    status: 'Trạng thái',
    category: 'Danh mục',
    all: 'Tất cả',
    createDoc: 'Thêm tài liệu',
    bulkImport: 'Nhập từ CSV',
    role: 'Vai trò',
    currentUser: 'Người dùng',
    loading: 'Đang tải danh sách tài liệu...',
    emptyState: 'Không tìm thấy tài liệu phù hợp với bộ lọc.',
    emptyAction: 'Hãy xóa bộ lọc hoặc thêm tài liệu mới.',
    code: 'Mã tài liệu',
    docTitle: 'Tiêu đề tài liệu',
    createdBy: 'Người tạo',
    createdDate: 'Ngày tạo',
    actions: 'Hành động',
    save: 'Lưu',
    cancel: 'Hủy',
    edit: 'Sửa',
    delete: 'Xóa',
    confirmDeleteTitle: 'Xóa tài liệu',
    confirmDeleteMsg: 'Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu EVD này? Hành động này không thể hoàn tác.',
    addSuccess: 'Đã thêm tài liệu thành công.',
    editSuccess: 'Đã cập nhật tài liệu thành công.',
    deleteSuccess: 'Đã xóa tài liệu thành công.',
    totalDocs: 'Tổng số tài liệu',
    pendingDocs: 'Chờ duyệt',
    approvedRate: 'Tỷ lệ đã duyệt',
    activeCats: 'Danh mục hoạt động',

    // Sidebar
    sidebarRegistryTitle: 'Phân hệ EVD',
    sidebarRegistryLink: 'Sổ đăng ký tài liệu',
    sidebarManagementTitle: 'Quản trị hệ thống',
    sidebarAccessControl: 'Kiểm soát truy cập',
    sidebarAuditLogs: 'Lịch sử hệ thống',
    sidebarRoleScope: 'Quyền',
    sidebarResetDb: 'Khôi phục dữ liệu mẫu',
  }
};

interface AppContextProps {
  userRole: USER_ROLE;
  currentUser: string;
  setRole: (role: USER_ROLE) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  triggerRefresh: boolean;
  refreshList: () => void;
  resetDatabase: () => void;
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<USER_ROLE>(USER_ROLE.ADMIN);
  const [currentUser, setCurrentUser] = useState<string>('Admin User');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  const [lang, setLangState] = useState<LangType>(
    () => (localStorage.getItem('sys_lang') as LangType) || 'en'
  );
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const setRole = useCallback((role: USER_ROLE) => {
    setUserRole(role);
    if (role === USER_ROLE.ADMIN) {
      setCurrentUser('Admin User');
    } else {
      setCurrentUser('Staff Member');
    }
    setTriggerRefresh((prev) => !prev);
  }, []);

  const setLang = useCallback((newLang: LangType) => {
    setLangState(newLang);
    localStorage.setItem('sys_lang', newLang);
  }, []);

  const t = useCallback((key: keyof typeof TRANSLATIONS['en']): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || String(key);
  }, [lang]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshList = useCallback(() => {
    setTriggerRefresh((prev) => !prev);
  }, []);

  const resetDatabase = useCallback(() => {
    mockApi.resetStorage();
    showToast(lang === 'en' ? 'Database reset to initial demo seeds.' : 'Hệ thống đã reset dữ liệu mẫu.', 'info');
    refreshList();
  }, [showToast, refreshList, lang]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentUser,
        setRole,
        toasts,
        showToast,
        dismissToast,
        triggerRefresh,
        refreshList,
        resetDatabase,
        lang,
        setLang,
        t,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
