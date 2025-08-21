// Generated API client from OpenAPI specification
// Auto-generated API client functions for Scireda API

import { 
  Network, NetworkCreation, NetworkUpdate,
  Folder, FolderCreation, FolderWithContent,
  Note, NoteUpsert,
  LoginRequest, RegisterRequest, User,
  GetNotesParams, DeleteFolderParams,
  ApiResponse
} from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:3333/scireda-api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as any)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError({
        message: errorData.message || `HTTP ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      });
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<void> {
    await this.request<void>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Set token for future requests
    this.setToken(response.token);
    
    return response;
  }

  async me(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
  }

  // Networks endpoints
  async getAllNetworks(): Promise<Network[]> {
    return this.request<Network[]>('/networks');
  }

  async createNetwork(data: NetworkCreation): Promise<Network> {
    return this.request<Network>('/networks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNetwork(id: number, data: NetworkUpdate): Promise<Network> {
    return this.request<Network>(`/networks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNetwork(id: number): Promise<void> {
    await this.request<void>(`/networks/${id}`, {
      method: 'DELETE',
    });
  }

  // Folders endpoints
  async getTopLevelFolders(networkId: number): Promise<FolderWithContent[]> {
    const params = new URLSearchParams({
      networkId: networkId.toString(),
    });

    return this.request<FolderWithContent[]>(`/folders/top-level?${params}`);
  }

  async getFolderContent(id: number): Promise<FolderWithContent> {
    return this.request<FolderWithContent>(`/folders/${id}`);
  }

  async createFolder(data: FolderCreation): Promise<Folder> {
    return this.request<Folder>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(id: number, params?: DeleteFolderParams): Promise<void> {
    const queryParams = new URLSearchParams();
    if (params?.force !== undefined) {
      queryParams.set('force', params.force.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/folders/${id}?${queryString}` : `/folders/${id}`;
    
    await this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Notes endpoints
  async getTopLevelNotes(networkId: number): Promise<Note[]> {
    const params = new URLSearchParams({
      networkId: networkId.toString(),
    });

    return this.request<Note[]>(`/notes/top-level?${params}`);
  }

  async getAllNotesInNetwork(networkId: number): Promise<Note[]> {
    // Get top-level notes first
    const topLevelNotes = await this.getTopLevelNotes(networkId);
    
    // Get all folder notes by checking each note's parentId
    const allNotes: Note[] = [...topLevelNotes];
    
    // For each note that might be a folder, get its children
    for (const note of topLevelNotes) {
      if (note.parentId) {
        try {
          const folderNotes = await this.getNotesByFolder(note.parentId);
          allNotes.push(...folderNotes);
        } catch {
          // Ignore errors for now
        }
      }
    }
    
    return allNotes;
  }

  async getNotesByFolder(folderId: number): Promise<Note[]> {
    const params = new URLSearchParams({
      folderId: folderId.toString(),
    });

    return this.request<Note[]>(`/notes?${params}`);
  }

  async createNote(data: NoteUpsert): Promise<Note> {
    return this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: number, data: NoteUpsert): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: number): Promise<void> {
    await this.request<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }
}

// Custom error class
class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor({ message, status, errors }: { message: string; status: number; errors?: Record<string, string[]> }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Create singleton instance
const apiClientInstance = new ApiClient();

// Function to sync token with auth store
export function syncApiClientToken(token: string | null) {
  apiClientInstance.setToken(token);
}

// Export singleton instance
export const apiClient = apiClientInstance;
export { ApiClient, ApiError };
