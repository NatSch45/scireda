// Examples of how to use the generated API hooks
// This file demonstrates usage patterns for the generated hooks

import { 
  useNetworks, useCreateNetwork, useUpdateNetwork, useDeleteNetwork,
  useCreateFolder, useDeleteFolder,
  useTopLevelNotes, useNotesByFolder, useCreateNote, useUpdateNote, useDeleteNote
} from './api-hooks';

// Example: Networks component
export function ExampleNetworksUsage() {
  // Fetch all networks
  const { data: networks, isLoading, error } = useNetworks();
  
  // Create network mutation
  const createNetwork = useCreateNetwork({
    onSuccess: () => {
      console.log('Network created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create network:', error.message);
    }
  });
  
  // Update network mutation
  const updateNetwork = useUpdateNetwork({
    onSuccess: (updatedNetwork) => {
      console.log('Network updated:', updatedNetwork.name);
    }
  });
  
  // Delete network mutation
  const deleteNetwork = useDeleteNetwork({
    onSuccess: () => {
      console.log('Network deleted successfully!');
    }
  });

  const handleCreateNetwork = async () => {
    try {
      await createNetwork.mutateAsync({
        name: 'My New Network',
        userId: 'current-user-id' // You'd get this from auth context
      });
    } catch (error) {
      // Error is already handled in onError callback
    }
  };

  const handleUpdateNetwork = async (networkId: number, newName: string) => {
    await updateNetwork.mutateAsync({
      id: networkId,
      data: { name: newName }
    });
  };

  const handleDeleteNetwork = async (networkId: number) => {
    await deleteNetwork.mutateAsync(networkId);
  };

  if (isLoading) return <div>Loading networks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreateNetwork} disabled={createNetwork.isPending}>
        {createNetwork.isPending ? 'Creating...' : 'Create Network'}
      </button>
      
      {networks?.map(network => (
        <div key={network.id}>
          <h3>{network.name}</h3>
          <button 
            onClick={() => handleUpdateNetwork(network.id, 'Updated Name')}
            disabled={updateNetwork.isPending}
          >
            Update
          </button>
          <button 
            onClick={() => handleDeleteNetwork(network.id)}
            disabled={deleteNetwork.isPending}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// Example: Notes component
export function ExampleNotesUsage() {
  const networkId = 1; // This would come from props or context
  
  // Fetch top-level notes for a network
  const { data: topLevelNotes, isLoading } = useTopLevelNotes(networkId);
  
  // Create note mutation
  const createNote = useCreateNote({
    onSuccess: (newNote) => {
      console.log('Note created:', newNote.title);
    }
  });
  
  // Update note mutation
  const updateNote = useUpdateNote();
  
  // Delete note mutation
  const deleteNote = useDeleteNote();

  const handleCreateNote = async () => {
    await createNote.mutateAsync({
      title: 'New Note',
      content: 'Note content here',
      networkId: networkId,
      // parentId is optional for top-level notes
    });
  };

  const handleUpdateNote = async (noteId: number) => {
    await updateNote.mutateAsync({
      id: noteId,
      data: {
        title: 'Updated Note Title',
        content: 'Updated content',
        networkId: networkId,
      }
    });
  };

  const handleDeleteNote = async (noteId: number) => {
    await deleteNote.mutateAsync(noteId);
  };

  if (isLoading) return <div>Loading notes...</div>;

  return (
    <div>
      <button onClick={handleCreateNote} disabled={createNote.isPending}>
        Create Note
      </button>
      
      {topLevelNotes?.map(note => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => handleUpdateNote(note.id)}>Update</button>
          <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// Example: Folder notes usage
export function ExampleFolderNotesUsage() {
  const folderId = 1; // This would come from props or context
  
  // Fetch notes in a specific folder
  const { data: folderNotes, isLoading } = useNotesByFolder(folderId);
  
  // Create folder mutation
  const createFolder = useCreateFolder();
  
  // Delete folder mutation
  const deleteFolder = useDeleteFolder();

  const handleCreateFolder = async () => {
    await createFolder.mutateAsync({
      name: 'New Folder',
      networkId: 1 // This would come from context
    });
  };

  const handleDeleteFolder = async (folderId: number, force: boolean = false) => {
    await deleteFolder.mutateAsync({
      id: folderId,
      params: { force }
    });
  };

  if (isLoading) return <div>Loading folder notes...</div>;

  return (
    <div>
      <button onClick={handleCreateFolder}>Create Folder</button>
      <button onClick={() => handleDeleteFolder(folderId)}>Delete Folder</button>
      <button onClick={() => handleDeleteFolder(folderId, true)}>Force Delete Folder</button>
      
      {folderNotes?.map(note => (
        <div key={note.id}>
          <h4>{note.title}</h4>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}
