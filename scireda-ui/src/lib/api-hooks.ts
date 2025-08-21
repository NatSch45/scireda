// Generated React Query hooks from OpenAPI specification
// Auto-generated React Query hooks for Scireda API

import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, ApiError } from './api-client-generated';
import {
  Network, NetworkCreation, NetworkUpdate,
  Folder, FolderCreation, FolderWithContent,
  Note, NoteUpsert,
  LoginRequest, RegisterRequest, User,
  DeleteFolderParams
} from './api-types';

// Query Keys
export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  networks: {
    all: () => ['networks'] as const,
    detail: (id: number) => ['networks', id] as const,
  },
  folders: {
    all: () => ['folders'] as const,
    topLevel: (networkId: number) => ['folders', 'top-level', networkId] as const,
    detail: (id: number) => ['folders', id] as const,
  },
  notes: {
    all: () => ['notes'] as const,
    topLevel: (networkId: number) => ['notes', 'top-level', networkId] as const,
    byFolder: (folderId: number) => ['notes', 'folder', folderId] as const,
    detail: (id: number) => ['notes', id] as const,
  },
} as const;

// Authentication hooks
export const useLogin = (
  options?: UseMutationOptions<{ token: string; user: User }, ApiError, LoginRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
    ...options,
  });
};

export const useRegister = (
  options?: UseMutationOptions<void, ApiError, RegisterRequest>
) => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    ...options,
  });
};

export const useMe = (
  options?: UseQueryOptions<User, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => apiClient.me(),
    ...options,
  });
};

export const useLogout = (
  options?: UseMutationOptions<void, ApiError, void>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
    ...options,
  });
};

// Networks hooks
export const useNetworks = (
  options?: UseQueryOptions<Network[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.networks.all(),
    queryFn: () => apiClient.getAllNetworks(),
    ...options,
  });
};

export const useCreateNetwork = (
  options?: UseMutationOptions<Network, ApiError, NetworkCreation>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: NetworkCreation) => apiClient.createNetwork(data),
    onSuccess: () => {
      // Invalidate networks list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.networks.all() });
    },
    ...options,
  });
};

export const useUpdateNetwork = (
  options?: UseMutationOptions<Network, ApiError, { id: number; data: NetworkUpdate }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateNetwork(id, data),
    onSuccess: (updatedNetwork) => {
      // Update the networks list cache
      queryClient.setQueryData(queryKeys.networks.all(), (old: Network[] | undefined) => {
        if (!old) return [updatedNetwork];
        return old.map(network => network.id === updatedNetwork.id ? updatedNetwork : network);
      });
    },
    ...options,
  });
};

export const useDeleteNetwork = (
  options?: UseMutationOptions<void, ApiError, number>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteNetwork(id),
    onSuccess: (_, deletedId) => {
      // Remove from networks list cache
      queryClient.setQueryData(queryKeys.networks.all(), (old: Network[] | undefined) => {
        if (!old) return [];
        return old.filter(network => network.id !== deletedId);
      });
      // Invalidate related data
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all() });
    },
    ...options,
  });
};

// Folders hooks
export const useTopLevelFolders = (
  networkId: number,
  options?: UseQueryOptions<FolderWithContent[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.folders.topLevel(networkId),
    queryFn: () => apiClient.getTopLevelFolders(networkId),
    enabled: !!networkId,
    ...options,
  });
};

export const useFolderContent = (
  folderId: number,
  options?: UseQueryOptions<FolderWithContent, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.folders.detail(folderId),
    queryFn: () => apiClient.getFolderContent(folderId),
    enabled: !!folderId,
    ...options,
  });
};

export const useCreateFolder = (
  options?: UseMutationOptions<Folder, ApiError, FolderCreation>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FolderCreation) => apiClient.createFolder(data),
    onSuccess: (newFolder) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all() });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.folders.topLevel(newFolder.networkId) 
      });
      if (newFolder.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.folders.detail(newFolder.parentId) 
        });
      }
      
      // Force refetch to ensure immediate UI update
      queryClient.refetchQueries({ 
        queryKey: queryKeys.folders.topLevel(newFolder.networkId) 
      });
    },
    ...options,
  });
};

export const useDeleteFolder = (
  options?: UseMutationOptions<void, ApiError, { id: number; params?: DeleteFolderParams }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, params }) => apiClient.deleteFolder(id, params),
    onSuccess: (_, { id }) => {
      // Invalidate all folder-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() });
      // Remove the deleted folder from cache
      queryClient.removeQueries({ queryKey: queryKeys.folders.detail(id) });
    },
    ...options,
  });
};

// Notes hooks
export const useTopLevelNotes = (
  networkId: number,
  options?: UseQueryOptions<Note[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.notes.topLevel(networkId),
    queryFn: () => apiClient.getTopLevelNotes(networkId),
    enabled: !!networkId,
    ...options,
  });
};

export const useNotesByFolder = (
  folderId: number,
  options?: UseQueryOptions<Note[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.notes.byFolder(folderId),
    queryFn: () => apiClient.getNotesByFolder(folderId),
    enabled: !!folderId,
    ...options,
  });
};

export const useCreateNote = (
  options?: UseMutationOptions<Note, ApiError, NoteUpsert>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: NoteUpsert) => apiClient.createNote(data),
    onSuccess: (newNote) => {
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.topLevel(newNote.networkId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.folders.topLevel(newNote.networkId) 
      });
      
      if (newNote.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notes.byFolder(newNote.parentId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.folders.detail(newNote.parentId) 
        });
      }
      
      // Force refetch to ensure immediate UI update
      queryClient.refetchQueries({ 
        queryKey: queryKeys.notes.topLevel(newNote.networkId) 
      });
      queryClient.refetchQueries({ 
        queryKey: queryKeys.folders.topLevel(newNote.networkId) 
      });
    },
    ...options,
  });
};

export const useUpdateNote = (
  options?: UseMutationOptions<Note, ApiError, { id: number; data: NoteUpsert }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateNote(id, data),
    onSuccess: (updatedNote) => {
      // Update caches optimistically
      queryClient.setQueryData(
        queryKeys.notes.topLevel(updatedNote.networkId),
        (old: Note[] | undefined) => {
          if (!old) return [updatedNote];
          return old.map(note => note.id === updatedNote.id ? updatedNote : note);
        }
      );
      
      if (updatedNote.parentId) {
        queryClient.setQueryData(
          queryKeys.notes.byFolder(updatedNote.parentId),
          (old: Note[] | undefined) => {
            if (!old) return [updatedNote];
            return old.map(note => note.id === updatedNote.id ? updatedNote : note);
          }
        );
      }
    },
    ...options,
  });
};

export const useDeleteNote = (
  options?: UseMutationOptions<void, ApiError, number>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteNote(id),
    onSuccess: (_, deletedId) => {
      // Invalidate all note-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all() });
    },
    ...options,
  });
};
