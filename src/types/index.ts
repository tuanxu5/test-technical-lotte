export enum DOCUMENT_CATEGORY {
  CONTRACT = 'CONTRACT',
  REPORT = 'REPORT',
  INVOICE = 'INVOICE',
  TECHNICAL = 'TECHNICAL',
}

export enum DOCUMENT_STATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Document {
  id: string;
  code: string;
  title: string;
  category: DOCUMENT_CATEGORY;
  status: DOCUMENT_STATUS;
  createdBy: string;
  createdDate: string; // ISO format
}

export enum USER_ROLE {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  name: string;
  role: USER_ROLE;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search: string;
  category: DOCUMENT_CATEGORY | 'ALL';
  status: DOCUMENT_STATUS | 'ALL';
}

export interface FetchDocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: {
    total: number;
    pending: number;
    approved: number;
    categoriesCount: number;
  };
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
