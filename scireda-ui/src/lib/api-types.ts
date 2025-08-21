// Generated from OpenAPI specification
// Auto-generated TypeScript types for Scireda API

export interface Network {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkCreation {
  name: string;
  userId: string;
}

export interface NetworkUpdate {
  name: string;
}

export interface Folder {
  id: number;
  name: string;
  networkId: number;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderCreation {
  name: string;
  networkId: number;
  parentId?: number | null;
}

export interface FolderWithContent {
  id: number;
  name: string;
  networkId: number;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
  network: Network;
  notes: Note[];
  subFolders: Folder[];
}

export interface Note {
  id: number;
  title: string;
  content: string;
  networkId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteUpsert {
  title: string;
  content: string;
  networkId: number;
  parentId?: number | null;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Query parameters
export interface GetNotesParams {
  folderId?: number;
  networkId?: number;
}

export interface DeleteFolderParams {
  force?: boolean;
}
