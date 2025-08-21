## Scireda UI

Projet React 18 + Vite + TypeScript strict, TailwindCSS, TanStack Query, Zustand, Router, Axios, Zod.

### Prérequis
- Node.js >= 18 (recommandé 20+)

### Installation
```bash
npm install
```

### Démarrer en dev
```bash
npm run dev
```
Application sur `http://localhost:5173`.

### Build
```bash
npm run build
npm run preview
```

### Lint & Format
```bash
npm run lint
npm run format
```

### Tests unitaires
```bash
npm run test
```

### Tests E2E (Playwright)
```bash
npm run e2e
```

### Structure
- `src/app`: `queryClient.ts`, `router.tsx`, `store.ts`, `ui/AppLayout.tsx`
- `src/lib`: `apiClient.ts` (axios + interceptors), `types.ts`
- `src/features/auth`: `api.ts`, `useAuth.ts`, `LoginPage.tsx`
- `src/features/{notes,folders,networks}`: pages placeholder
- `src/pages/HomePage.tsx`

### Authentification
- Token JWT Bearer stocké dans `localStorage`
- Interceptor Axios ajoute `Authorization: Bearer <token>`
- Redirection automatique vers `/login` pour les routes protégées (`/notes`, `/folders`, `/networks`)


