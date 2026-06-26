export type DocumentCategory = 'Contract' | 'Report' | 'Invoice' | 'Technical';
export type DocumentStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface Document {
  id: string;
  code: string;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  createdBy: string;
  createdDate: string; // ISO format
}

export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search: string;
  category: DocumentCategory | 'ALL';
  status: DocumentStatus | 'ALL';
}

export interface FetchDocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CellValidationError {
  field: keyof Document;
  message: string;
}

export interface RowValidationError {
  rowNumber: number;
  code?: string;
  title?: string;
  errors: string[];
}
