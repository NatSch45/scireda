import { Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockNetwork {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockNote {
  id: number;
  title: string;
  content: string;
  networkId: number;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockFolder {
  id: number;
  name: string;
  networkId: number;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockFolderWithContent extends MockFolder {
  network: MockNetwork;
  notes: MockNote[];
  subFolders: MockFolder[];
}

/**
 * Setup authenticated user session with mock data
 */
export async function setupAuth(page: Page, user?: Partial<MockUser>) {
  const defaultUser: MockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...user
  };

  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
  });
  
  await page.route('**/scireda-api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultUser)
    });
  });

  return defaultUser;
}

/**
 * Mock networks API
 */
export async function mockNetworks(page: Page, networks: MockNetwork[] = []) {
  const defaultNetworks: MockNetwork[] = networks.length > 0 ? networks : [
    {
      id: 1,
      name: 'Test Network',
      userId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  await page.route('**/scireda-api/networks', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultNetworks)
      });
    }
  });

  return defaultNetworks;
}

/**
 * Mock top-level folders for a network
 */
export async function mockTopLevelFolders(page: Page, networkId: number, folders: MockFolderWithContent[] = []) {
  await page.route(`**/scireda-api/folders/top-level?networkId=${networkId}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(folders)
    });
  });

  return folders;
}

/**
 * Mock top-level notes for a network
 */
export async function mockTopLevelNotes(page: Page, networkId: number, notes: MockNote[] = []) {
  await page.route(`**/scireda-api/notes/top-level?networkId=${networkId}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(notes)
    });
  });

  return notes;
}

/**
 * Mock folder content API
 */
export async function mockFolderContent(page: Page, folderId: number, content: MockFolderWithContent) {
  await page.route(`**/scireda-api/folders/${folderId}`, async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(content)
      });
    }
  });

  return content;
}

/**
 * Mock note creation
 */
export async function mockNoteCreation(page: Page) {
  await page.route('**/scireda-api/notes', async route => {
    if (route.request().method() === 'POST') {
      const postData = await route.request().postDataJSON();
      const newNote: MockNote = {
        id: Math.floor(Math.random() * 1000) + 100,
        title: postData.title,
        content: postData.content,
        networkId: postData.networkId,
        parentId: postData.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newNote)
      });
    }
  });
}

/**
 * Mock folder creation
 */
export async function mockFolderCreation(page: Page) {
  await page.route('**/scireda-api/folders', async route => {
    if (route.request().method() === 'POST') {
      const postData = await route.request().postDataJSON();
      const newFolder: MockFolder = {
        id: Math.floor(Math.random() * 1000) + 100,
        name: postData.name,
        networkId: postData.networkId,
        parentId: postData.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newFolder)
      });
    }
  });
}

/**
 * Mock note updates
 */
export async function mockNoteUpdate(page: Page, noteId: number) {
  await page.route(`**/scireda-api/notes/${noteId}`, async route => {
    if (route.request().method() === 'PUT') {
      const putData = await route.request().postDataJSON();
      const updatedNote: MockNote = {
        id: noteId,
        title: putData.title,
        content: putData.content,
        networkId: putData.networkId,
        parentId: putData.parentId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedNote)
      });
    }
  });
}

/**
 * Mock item deletion
 */
export async function mockDeletion(page: Page, endpoint: string) {
  await page.route(endpoint, async route => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 204 });
    }
  });
}

/**
 * Setup a complete workspace with auth, networks, folders, and notes
 */
export async function setupCompleteWorkspace(page: Page, options?: {
  user?: Partial<MockUser>;
  networks?: MockNetwork[];
  folders?: MockFolderWithContent[];
  notes?: MockNote[];
  networkId?: number;
}) {
  const networkId = options?.networkId || 1;
  
  const user = await setupAuth(page, options?.user);
  const networks = await mockNetworks(page, options?.networks);
  const folders = await mockTopLevelFolders(page, networkId, options?.folders);
  const notes = await mockTopLevelNotes(page, networkId, options?.notes);

  // Enable creation mocks by default
  await mockNoteCreation(page);
  await mockFolderCreation(page);

  return { user, networks, folders, notes };
}

/**
 * Wait for API calls to complete
 */
export async function waitForApiCalls(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}
