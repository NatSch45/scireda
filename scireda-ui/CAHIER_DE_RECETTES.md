# Cahier de Recettes - Scireda Frontend

## 📋 Vue d'ensemble

Ce cahier de recettes documente l'ensemble des fonctionnalités implémentées dans l'application frontend Scireda, une plateforme de gestion de notes et de recherche organisée en réseaux de connaissances.

## 🏗️ Architecture de l'Application

### Structure des Routes
- **Page d'accueil** (`/`) - Page de présentation
- **Authentification** (`/login`, `/register`) - Connexion et inscription
- **Réseaux** (`/networks`) - Gestion des réseaux de recherche
- **Espace de travail** (`/network/:id`) - Interface principale d'édition
- **Profil utilisateur** (`/me`) - Gestion du compte
- **Page 404** (`/*`) - Gestion des erreurs de navigation

### Technologies Utilisées
- **React 18** avec TypeScript
- **React Router 6** pour la navigation
- **TanStack Query** pour la gestion des données
- **Zustand** pour la gestion d'état globale
- **Tailwind CSS** pour le styling
- **React Markdown** pour le rendu Markdown
- **Vitest** pour les tests

---

## 🧪 Tests et Recettes

### 1. Authentification

#### Test 1.1 : Inscription d'un nouvel utilisateur
**Objectif** : Vérifier que l'inscription fonctionne correctement

**Étapes** :
1. Naviguer vers `/register`
2. Saisir un nom d'utilisateur valide
3. Saisir une adresse email valide
4. Saisir un mot de passe (minimum 6 caractères)
5. Confirmer le mot de passe
6. Cliquer sur "Créer mon compte"

**Résultat attendu** :
- ✅ Validation des champs en temps réel
- ✅ Messages d'erreur clairs en cas de saisie invalide
- ✅ Redirection vers la page de connexion avec message de succès
- ✅ Accessibilité : navigation au clavier, annonces vocales

**Cas d'erreur à tester** :
- Email déjà utilisé
- Mots de passe non identiques
- Champs obligatoires manquants

#### Test 1.2 : Connexion utilisateur
**Objectif** : Vérifier que la connexion fonctionne correctement

**Étapes** :
1. Naviguer vers `/login`
2. Saisir email et mot de passe valides
3. Cliquer sur "Se connecter"

**Résultat attendu** :
- ✅ Validation du format email
- ✅ Redirection automatique vers `/networks` après connexion
- ✅ Token d'authentification stocké
- ✅ Message de succès après inscription visible
- ✅ Gestion des erreurs d'authentification

#### Test 1.3 : Protection des routes
**Objectif** : Vérifier que les routes protégées nécessitent une authentification

**Étapes** :
1. Sans être connecté, essayer d'accéder à `/networks`
2. Essayer d'accéder à `/network/1`
3. Essayer d'accéder à `/me`

**Résultat attendu** :
- ✅ Redirection automatique vers `/login`
- ✅ Preservation de l'URL de destination après connexion

#### Test 1.4 : Redirection utilisateur connecté
**Objectif** : Vérifier que les utilisateurs connectés sont redirigés depuis la page d'accueil

**Étapes** :
1. Se connecter
2. Naviguer vers `/`

**Résultat attendu** :
- ✅ Redirection automatique vers `/networks`

---

### 2. Page d'Accueil

#### Test 2.1 : Affichage de la page d'accueil
**Objectif** : Vérifier l'affichage correct de la page d'accueil pour les utilisateurs non connectés

**Étapes** :
1. Naviguer vers `/` sans être connecté
2. Vérifier la présence de tous les éléments

**Résultat attendu** :
- ✅ Titre "Bienvenue sur Scireda" affiché
- ✅ Description de l'application présente
- ✅ Boutons "Se connecter" et "Créer un compte" fonctionnels
- ✅ Section des fonctionnalités (3 cartes) affichée
- ✅ Section CTA en bas de page
- ✅ Design responsive sur mobile/tablet/desktop

#### Test 2.2 : Navigation depuis la page d'accueil
**Objectif** : Vérifier que les liens de navigation fonctionnent

**Étapes** :
1. Cliquer sur "Se connecter"
2. Revenir et cliquer sur "Créer un compte"
3. Tester le bouton "Créer mon compte gratuit" en bas

**Résultat attendu** :
- ✅ Navigation vers `/login` et `/register`
- ✅ Pas de rechargement de page (SPA)

---

### 3. Gestion des Réseaux

#### Test 3.1 : Affichage de la liste des réseaux
**Objectif** : Vérifier l'affichage de la page des réseaux

**Étapes** :
1. Se connecter
2. Naviguer vers `/networks`

**Résultat attendu** :
- ✅ Titre "Mes Réseaux" affiché
- ✅ Bouton "Créer un nouveau réseau" visible
- ✅ Liste des réseaux existants (si applicable)
- ✅ État vide avec message d'encouragement si aucun réseau
- ✅ Indicateur de chargement pendant la récupération des données

#### Test 3.2 : Création d'un nouveau réseau
**Objectif** : Vérifier la création de réseaux

**Étapes** :
1. Cliquer sur "Créer un nouveau réseau"
2. Saisir un nom de réseau
3. Cliquer sur "Créer"

**Résultat attendu** :
- ✅ Formulaire de création affiché
- ✅ Champ de saisie avec focus automatique
- ✅ Validation : nom requis
- ✅ Boutons "Créer" et "Annuler" fonctionnels
- ✅ Réseau ajouté à la liste après création
- ✅ Formulaire fermé automatiquement
- ✅ État de chargement pendant la création

#### Test 3.3 : Suppression d'un réseau
**Objectif** : Vérifier la suppression de réseaux

**Étapes** :
1. Cliquer sur l'icône de suppression d'un réseau
2. Confirmer la suppression

**Résultat attendu** :
- ✅ Dialogue de confirmation affiché
- ✅ Nom du réseau mentionné dans la confirmation
- ✅ Réseau supprimé de la liste après confirmation
- ✅ Possibilité d'annuler la suppression

#### Test 3.4 : Navigation vers un réseau
**Objectif** : Vérifier l'ouverture d'un réseau

**Étapes** :
1. Cliquer sur "Ouvrir le réseau" d'un réseau existant

**Résultat attendu** :
- ✅ Navigation vers `/network/:id`
- ✅ Chargement de l'interface d'édition

---

### 4. Espace de Travail (Network Workspace)

#### Test 4.1 : Chargement de l'espace de travail
**Objectif** : Vérifier le chargement correct de l'interface principale

**Étapes** :
1. Naviguer vers `/network/1` (avec un réseau existant)

**Résultat attendu** :
- ✅ Header avec nom du réseau et navigation
- ✅ Explorateur de fichiers à gauche (largeur fixe 320px)
- ✅ Éditeur de notes à droite
- ✅ Indicateur de sauvegarde dans le header
- ✅ Bouton de retour vers la liste des réseaux

#### Test 4.2 : Gestion des erreurs de réseau
**Objectif** : Vérifier la gestion des cas d'erreur

**Étapes** :
1. Naviguer vers `/network/999` (ID inexistant)
2. Naviguer vers `/network/invalid` (ID invalide)

**Résultat attendu** :
- ✅ Message d'erreur explicite pour réseau inexistant
- ✅ Redirection automatique pour ID invalide
- ✅ Bouton de retour vers la liste des réseaux
- ✅ Gestion des erreurs de chargement réseau

---

### 5. Explorateur de Fichiers

#### Test 5.1 : Affichage de l'arborescence
**Objectif** : Vérifier l'affichage de la structure des dossiers et notes

**Étapes** :
1. Observer l'explorateur de fichiers dans un réseau

**Résultat attendu** :
- ✅ Dossiers et notes de niveau racine affichés
- ✅ Icônes distinctives pour dossiers et notes
- ✅ Possibilité d'expansion/réduction des dossiers
- ✅ Indication visuelle des éléments sélectionnés
- ✅ Boutons d'action (créer, supprimer) visibles au survol

#### Test 5.2 : Création de dossiers
**Objectif** : Vérifier la création de nouveaux dossiers

**Étapes** :
1. Cliquer sur l'icône "+" à côté de "Dossiers"
2. Sélectionner "Nouveau dossier"
3. Saisir un nom et valider

**Résultat attendu** :
- ✅ Formulaire de création affiché inline
- ✅ Validation du nom (requis, non vide)
- ✅ Dossier ajouté à l'arborescence
- ✅ Possibilité d'annuler la création
- ✅ Focus automatique sur le champ de saisie

#### Test 5.3 : Création de notes
**Objectif** : Vérifier la création de nouvelles notes

**Étapes** :
1. Cliquer sur l'icône "+" à côté de "Notes" ou d'un dossier
2. Sélectionner "Nouvelle note"
3. Saisir un nom et valider

**Résultat attendu** :
- ✅ Note créée avec contenu par défaut (titre en Markdown)
- ✅ Note ajoutée à la bonne location (racine ou dossier)
- ✅ Sélection automatique de la nouvelle note
- ✅ Ouverture dans l'éditeur

#### Test 5.4 : Navigation dans les dossiers
**Objectif** : Vérifier l'expansion et la navigation dans les dossiers

**Étapes** :
1. Cliquer sur un dossier pour l'étendre
2. Observer le contenu
3. Créer des sous-éléments

**Résultat attendu** :
- ✅ Animation d'expansion fluide
- ✅ Chargement du contenu du dossier
- ✅ Possibilité de créer des sous-dossiers et sous-notes
- ✅ Indication visuelle de la hiérarchie (indentation)

#### Test 5.5 : Suppression d'éléments
**Objectif** : Vérifier la suppression de dossiers et notes

**Étapes** :
1. Cliquer sur l'icône de suppression d'une note
2. Confirmer la suppression
3. Tester avec un dossier non vide

**Résultat attendu** :
- ✅ Modal de confirmation avec détails
- ✅ Suppression effective après confirmation
- ✅ Gestion spéciale pour dossiers non vides
- ✅ Messages d'erreur appropriés
- ✅ Mise à jour immédiate de l'interface

---

### 6. Éditeur de Notes

#### Test 6.1 : Interface de l'éditeur
**Objectif** : Vérifier l'affichage et les fonctionnalités de base

**Étapes** :
1. Sélectionner une note dans l'explorateur
2. Observer l'interface de l'éditeur

**Résultat attendu** :
- ✅ Champ de titre éditable en haut
- ✅ Boutons de mode d'affichage (Édition, Aperçu, Divisé)
- ✅ Zone d'édition Markdown
- ✅ Aperçu en temps réel en mode divisé
- ✅ Indicateur d'état vide quand aucune note sélectionnée

#### Test 6.2 : Édition du titre
**Objectif** : Vérifier l'édition du titre des notes

**Étapes** :
1. Modifier le titre d'une note
2. Appuyer sur Entrée
3. Observer la sauvegarde

**Résultat attendu** :
- ✅ Titre modifiable directement
- ✅ Focus automatique sur l'éditeur après Entrée
- ✅ Sauvegarde automatique après 2 secondes d'inactivité
- ✅ Indication visuelle des modifications non sauvegardées

#### Test 6.3 : Édition du contenu Markdown
**Objectif** : Vérifier l'édition du contenu

**Étapes** :
1. Modifier le contenu d'une note
2. Utiliser différents éléments Markdown (titres, listes, liens, code)
3. Observer l'aperçu

**Résultat attendu** :
- ✅ Zone de texte redimensionnable
- ✅ Sauvegarde automatique après 3 secondes d'inactivité
- ✅ Aperçu Markdown en temps réel
- ✅ Support de GitHub Flavored Markdown
- ✅ Coloration syntaxique du code
- ✅ Rendu correct des éléments Markdown

#### Test 6.4 : Modes d'affichage
**Objectif** : Vérifier les différents modes d'affichage

**Étapes** :
1. Tester le mode "Édition" (éditeur seul)
2. Tester le mode "Aperçu" (rendu seul)
3. Tester le mode "Divisé" (éditeur + aperçu)

**Résultat attendu** :
- ✅ Transition fluide entre les modes
- ✅ Mode édition : éditeur pleine largeur
- ✅ Mode aperçu : rendu Markdown pleine largeur
- ✅ Mode divisé : 50/50 éditeur et aperçu
- ✅ Sauvegarde des préférences de mode

#### Test 6.5 : Sauvegarde automatique
**Objectif** : Vérifier le système de sauvegarde automatique

**Étapes** :
1. Modifier une note
2. Observer les indicateurs de statut
3. Attendre la sauvegarde automatique
4. Changer de note rapidement

**Résultat attendu** :
- ✅ Indicateur "Modifications non sauvegardées" (point orange)
- ✅ Indicateur "Sauvegardé" (point vert) après sauvegarde
- ✅ Bouton "Sauvegarder" manuel disponible
- ✅ Sauvegarde avant changement de note
- ✅ Sauvegarde avant fermeture de page (beforeunload)

---

### 7. Accessibilité

#### Test 7.1 : Navigation au clavier
**Objectif** : Vérifier l'accessibilité au clavier

**Étapes** :
1. Naviguer dans l'application uniquement au clavier (Tab, Entrée, Échap)
2. Tester tous les éléments interactifs

**Résultat attendu** :
- ✅ Tous les éléments focusables sont accessibles
- ✅ Ordre de tabulation logique
- ✅ Indicateurs de focus visibles
- ✅ Raccourcis clavier fonctionnels
- ✅ Piège de focus dans les modals

#### Test 7.2 : Lecteurs d'écran
**Objectif** : Vérifier la compatibilité avec les lecteurs d'écran

**Étapes** :
1. Tester avec un lecteur d'écran (NVDA, JAWS, VoiceOver)
2. Naviguer dans l'application

**Résultat attendu** :
- ✅ Titres hiérarchiques correctement balisés
- ✅ Labels appropriés pour les champs de formulaire
- ✅ Descriptions des boutons et liens
- ✅ Annonces des changements d'état
- ✅ Rôles ARIA appropriés

#### Test 7.3 : Contrastes et lisibilité
**Objectif** : Vérifier les contrastes visuels

**Étapes** :
1. Vérifier les contrastes de couleur
2. Tester avec différentes tailles d'écran

**Résultat attendu** :
- ✅ Contraste minimum 4.5:1 pour le texte normal
- ✅ Contraste minimum 3:1 pour le texte large
- ✅ Lisibilité sur tous les arrière-plans
- ✅ Pas de dépendance uniquement à la couleur

---

### 8. Responsive Design

#### Test 8.1 : Affichage mobile (< 768px)
**Objectif** : Vérifier l'adaptation mobile

**Étapes** :
1. Redimensionner la fenêtre à 375px de large
2. Naviguer dans toutes les pages

**Résultat attendu** :
- ✅ Layout adaptatif sans débordement horizontal
- ✅ Navigation mobile optimisée
- ✅ Boutons et liens suffisamment grands (44px min)
- ✅ Texte lisible sans zoom
- ✅ Formulaires utilisables sur mobile

#### Test 8.2 : Affichage tablette (768px - 1024px)
**Objectif** : Vérifier l'adaptation tablette

**Étapes** :
1. Tester à 768px et 1024px de large
2. Vérifier l'espace de travail

**Résultat attendu** :
- ✅ Explorateur de fichiers adapté
- ✅ Éditeur utilisable
- ✅ Navigation tactile optimisée

#### Test 8.3 : Affichage desktop (> 1024px)
**Objectif** : Vérifier l'expérience desktop optimale

**Étapes** :
1. Tester sur différentes résolutions desktop
2. Vérifier l'utilisation de l'espace

**Résultat attendu** :
- ✅ Utilisation optimale de l'espace horizontal
- ✅ Lisibilité sur grands écrans
- ✅ Pas d'étirement excessif des éléments

---

### 9. Gestion des Erreurs

#### Test 9.1 : Erreurs réseau
**Objectif** : Vérifier la gestion des erreurs de connectivité

**Étapes** :
1. Déconnecter le réseau
2. Essayer d'effectuer des actions
3. Reconnecter le réseau

**Résultat attendu** :
- ✅ Messages d'erreur explicites
- ✅ Possibilité de réessayer
- ✅ Récupération automatique après reconnexion
- ✅ Pas de perte de données en cours d'édition

#### Test 9.2 : Erreurs d'authentification
**Objectif** : Vérifier la gestion de l'expiration de session

**Étapes** :
1. Laisser la session expirer
2. Essayer d'effectuer des actions

**Résultat attendu** :
- ✅ Détection de l'expiration de session
- ✅ Redirection vers la page de connexion
- ✅ Conservation de l'URL de destination

#### Test 9.3 : Erreurs 404
**Objectif** : Vérifier la gestion des pages inexistantes

**Étapes** :
1. Naviguer vers une URL inexistante
2. Vérifier la page 404

**Résultat attendu** :
- ✅ Page 404 personnalisée affichée
- ✅ Navigation de retour disponible
- ✅ Message d'erreur explicite

---

### 10. Performance

#### Test 10.1 : Temps de chargement
**Objectif** : Vérifier les performances de chargement

**Étapes** :
1. Mesurer le temps de chargement initial
2. Mesurer la navigation entre pages
3. Vérifier le lazy loading

**Résultat attendu** :
- ✅ Chargement initial < 3 secondes
- ✅ Navigation instantanée (SPA)
- ✅ Chargement progressif des données
- ✅ Indicateurs de chargement appropriés

#### Test 10.2 : Optimisation des requêtes
**Objectif** : Vérifier l'efficacité des requêtes API

**Étapes** :
1. Observer les requêtes réseau dans DevTools
2. Vérifier la mise en cache

**Résultat attendu** :
- ✅ Pas de requêtes redondantes
- ✅ Mise en cache efficace avec React Query
- ✅ Invalidation appropriée du cache
- ✅ Requêtes optimistes pour les mutations

---

## 🔧 Outils de Test

### Tests Automatisés
- **Vitest** : Tests unitaires et d'intégration
- **Testing Library** : Tests des composants React
- **MSW** : Mock des APIs pour les tests

### Tests Manuels
- **DevTools** : Inspection des performances et réseau
- **Lighthouse** : Audit de performance et accessibilité
- **Wave** : Test d'accessibilité
- **Contrast Checker** : Vérification des contrastes

### Commandes de Test
```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests e2e
npm run e2e

# Linting et formatage
npm run lint
npm run format
```

---

## 📝 Critères d'Acceptation Globaux

### Fonctionnalité
- ✅ Toutes les fonctionnalités principales implémentées
- ✅ Gestion d'erreur robuste
- ✅ Performance acceptable (< 3s chargement initial)

### Qualité
- ✅ Code TypeScript strict
- ✅ Couverture de tests > 80%
- ✅ Pas d'erreurs ESLint
- ✅ Code formaté avec Prettier

### Accessibilité
- ✅ Conformité WCAG 2.1 AA
- ✅ Navigation au clavier complète
- ✅ Contrastes respectés
- ✅ Support des lecteurs d'écran

### Compatibilité
- ✅ Chrome, Firefox, Safari, Edge (versions récentes)
- ✅ Mobile iOS et Android
- ✅ Responsive design complet

---

## 🚀 Prochaines Étapes

### Améliorations Identifiées
1. **Recherche globale** dans les notes et dossiers
2. **Raccourcis clavier** avancés
3. **Mode sombre/clair** toggle
4. **Collaboration temps réel**
5. **Export/Import** de données
6. **Historique des versions** des notes

### Tests Supplémentaires Recommandés
1. **Tests de charge** avec de nombreuses notes
2. **Tests de sécurité** (XSS, CSRF)
3. **Tests d'accessibilité** automatisés
4. **Tests de performance** sur mobile

---

*Ce cahier de recettes est un document vivant qui doit être mis à jour à chaque nouvelle fonctionnalité ou modification significative de l'application.*
