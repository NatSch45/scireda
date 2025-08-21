# Architecture Scireda UI

## Vue d'ensemble

Scireda UI est une application React moderne pour la gestion de notes et de réseaux de recherche. L'architecture suit un modèle centré sur les réseaux avec un système de fichiers intégré.

## Structure de Navigation

### 1. Page d'Accueil (`/`)
- **Non connecté** : Page de présentation avec liens vers login/register
- **Connecté** : Redirection automatique vers `/networks`

### 2. Écran des Réseaux (`/networks`)
- Liste tous les réseaux de l'utilisateur
- Permet de créer de nouveaux réseaux
- Permet de supprimer des réseaux existants
- Navigation vers un réseau spécifique via `/network/:id`

### 3. Workspace d'un Réseau (`/network/:networkId`)
- Interface divisée en deux parties :
  - **Gauche** : Explorateur de fichiers (FileExplorer)
  - **Droite** : Éditeur de notes (NoteEditor avec Milkdown)

## Composants Principaux

### NetworksHomePage
- Gestion des réseaux de l'utilisateur
- Interface pour créer/supprimer des réseaux
- Navigation vers les workspaces

### NetworkWorkspacePage  
- Interface principale de travail
- Gestion de l'état des notes sélectionnées
- Sauvegarde automatique des modifications
- Navigation avec breadcrumbs

### FileExplorer
- Arbre de navigation des dossiers et notes
- Création de nouveaux dossiers/notes
- Suppression d'éléments
- Sélection de notes pour édition

### NoteEditor
- Éditeur Markdown basé sur Milkdown
- Édition du titre et du contenu
- Affichage des métadonnées (dates, ID)
- Barre de statut avec informations de sauvegarde

## API et Gestion des Données

### Hooks Générés
Tous les hooks sont générés à partir de la spécification OpenAPI :

- **Authentification** : `useLogin`, `useRegister`, `useMe`, `useLogout`
- **Réseaux** : `useNetworks`, `useCreateNetwork`, `useUpdateNetwork`, `useDeleteNetwork`
- **Dossiers** : `useCreateFolder`, `useDeleteFolder`
- **Notes** : `useTopLevelNotes`, `useNotesByFolder`, `useCreateNote`, `useUpdateNote`, `useDeleteNote`

### Client API
- Client généré automatiquement (`api-client-generated.ts`)
- Gestion automatique de l'authentification Bearer
- Gestion des erreurs typées
- Support de tous les endpoints de l'API

### Types TypeScript
- Types générés à partir des schémas OpenAPI
- Sécurité de type complète
- Interfaces pour toutes les entités (Network, Folder, Note, User)

## Fonctionnalités Avancées

### Sauvegarde Automatique
- Sauvegarde automatique après 2-3 secondes d'inactivité
- Indicateur visuel de l'état de sauvegarde
- Sauvegarde forcée avant changement de note
- Sauvegarde avant fermeture de page

### Gestion du Cache
- Cache intelligent avec TanStack Query
- Invalidations automatiques des données liées
- Mises à jour optimistes pour une meilleure UX

### Interface Utilisateur
- Thème sombre moderne
- Design responsive
- Accessibilité (ARIA labels, focus states)
- Feedback visuel pour toutes les actions

## Structure des Fichiers

```
src/
├── app/                    # Configuration globale
│   ├── router.tsx         # Configuration des routes
│   ├── store.ts           # Store Zustand
│   └── ui/AppLayout.tsx   # Layout principal
├── components/            # Composants réutilisables
│   ├── FileExplorer.tsx   # Explorateur de fichiers
│   └── NoteEditor.tsx     # Éditeur Milkdown
├── features/              # Features par domaine
│   └── auth/              # Authentification
├── lib/                   # Utilitaires et API
│   ├── api-types.ts       # Types générés
│   ├── api-client-generated.ts  # Client API
│   └── api-hooks.ts       # Hooks React Query
├── pages/                 # Pages principales
│   ├── HomePage.tsx       # Page d'accueil
│   ├── NetworksHomePage.tsx     # Gestion des réseaux
│   └── NetworkWorkspacePage.tsx # Workspace
└── styles/
    └── milkdown.css       # Styles pour l'éditeur
```

## Technologies Utilisées

- **React 18** avec hooks modernes
- **TypeScript** strict pour la sécurité de type
- **TailwindCSS** pour le styling
- **TanStack Query** pour la gestion des données serveur
- **Zustand** pour l'état local
- **React Router** pour la navigation
- **Milkdown** pour l'édition Markdown
- **Axios** pour les requêtes HTTP

## Workflow de Développement

1. **Génération automatique** : Les types, client API et hooks sont générés à partir de la spec OpenAPI
2. **Développement typé** : Utilisation des hooks générés dans les composants
3. **Tests** : Vitest + Testing Library pour les tests unitaires
4. **Linting** : ESLint + Prettier pour la qualité du code

## Prochaines Étapes

- [ ] Implémentation du support des dossiers hiérarchiques
- [ ] Système de liens entre notes
- [ ] Recherche full-text dans les notes
- [ ] Collaboration en temps réel
- [ ] Export/import de réseaux
- [ ] Thèmes personnalisables
